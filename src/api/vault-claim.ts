// In-wallet vault claim flow.
//
// Minimal pipeline (mirrors @cef-ai/vault-sdk's `vault.ensure()` + onboarding,
// but without needing the embed-wallet adapter — we ARE the wallet, we have
// the key directly):
//
//   1. Build a local Polkadot ed25519 pair from the Web3Auth seed.
//   2. Hit the gateway's onboarding/status. If `gateway_is_proxy` is already
//      true, jump straight to (4).
//   3. If onboarding is required:
//        a. Call /auth/onboarding/bootstrap to drip CERE + DDC deposit (devnet only).
//        b. Submit `proxy.addProxy(gatewayPubkey, NonTransfer, 0)` from the user's
//           wallet via @polkadot/api so the gateway can act on their behalf.
//        c. Poll /auth/onboarding/status until `gateway_is_proxy === true`.
//   4. Use @cef-ai/vault-sdk to claim the vault (`vault.ensure({ onboard: false })`).

import { VaultSDK, KeypairWallet } from '@cef-ai/vault-sdk';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady, encodeAddress } from '@polkadot/util-crypto';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';

export const VAULT_API = 'https://vault-api.compute.dev.ddcdragon.com';
export const GATEWAY = 'https://ddc-s3-gateway.compute.dev.ddcdragon.com';
export const RPC = 'wss://rpc.devnet.cere.network/ws';
export const CERE_SS58_PREFIX = 54;

export type ClaimProgress = { kind: string; detail?: string };

type OnboardingStatus = {
  address: string;
  native_balance: string;
  native_floor: string;
  ddc_deposit_total: string;
  gateway_is_proxy: boolean;
  faucet_eligible: boolean;
  ddc_seed_eligible: boolean;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const u8ToHex = (u: Uint8Array) => '0x' + Array.from(u, (b) => b.toString(16).padStart(2, '0')).join('');

async function signedHeaders(pair: ReturnType<Keyring['addFromSeed']>): Promise<HeadersInit> {
  // Onboarding endpoints sign over an EMPTY byte array — same convention as
  // vault-api's auth on probes. The signed value is meaningless; the headers
  // act as proof of pubkey ownership at request time.
  const sig = pair.sign(new Uint8Array(0));
  return {
    'X-Public-Key': u8ToHex(pair.publicKey),
    'X-Signature': Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join(''),
    'X-Signature-Type': 'ed25519',
  };
}

async function getStatus(pair: ReturnType<Keyring['addFromSeed']>): Promise<OnboardingStatus | null> {
  const r = await fetch(`${GATEWAY}/auth/onboarding/status`, {
    method: 'GET',
    headers: await signedHeaders(pair),
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`onboarding status ${r.status}`);
  return (await r.json()) as OnboardingStatus;
}

async function bootstrap(pair: ReturnType<Keyring['addFromSeed']>): Promise<void> {
  const r = await fetch(`${GATEWAY}/auth/onboarding/bootstrap`, {
    method: 'POST',
    headers: await signedHeaders(pair),
  });
  if (r.status !== 200 && r.status !== 207) {
    const body = await r.text().catch(() => '');
    throw new Error(`onboarding bootstrap ${r.status}: ${body}`);
  }
}

async function fetchGatewayPubkey(): Promise<string> {
  const r = await fetch(`${GATEWAY}/auth/info`, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`auth/info ${r.status}`);
  const j = await r.json();
  const pk = j.gateway_public_key || j.pubkey;
  if (!pk) throw new Error('gateway pubkey missing in /auth/info');
  return pk.startsWith('0x') ? pk : '0x' + pk;
}

async function submitAddProxy(
  pair: ReturnType<Keyring['addFromSeed']>,
  gatewayPubkey: string,
  onProgress: (e: ClaimProgress) => void,
): Promise<void> {
  onProgress({ kind: 'connecting-rpc', detail: RPC });
  const provider = new WsProvider(RPC);
  const api = await ApiPromise.create({ provider });
  try {
    // Gateway pubkey arrives as raw 0x-hex; convert to SS58 for proxy.addProxy.
    const cleanHex = gatewayPubkey.startsWith('0x') ? gatewayPubkey.slice(2) : gatewayPubkey;
    const delegateBytes = new Uint8Array(cleanHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
    const delegateSs58 = encodeAddress(delegateBytes, CERE_SS58_PREFIX);

    onProgress({ kind: 'submitting-add-proxy', detail: delegateSs58 });
    const tx = api.tx.proxy.addProxy(delegateSs58, 'NonTransfer', 0);

    await new Promise<void>((resolve, reject) => {
      let unsub: (() => void) | undefined;
      tx.signAndSend(pair, (result) => {
        if (result.dispatchError) {
          unsub?.();
          reject(new Error(result.dispatchError.toString()));
          return;
        }
        if (result.status.isInBlock || result.status.isFinalized) {
          unsub?.();
          resolve();
        }
      })
        .then((u) => {
          unsub = u as unknown as () => void;
        })
        .catch(reject);
    });
  } finally {
    await api.disconnect();
  }
}

async function pollUntilProxy(
  pair: ReturnType<Keyring['addFromSeed']>,
  timeoutMs = 60_000,
  intervalMs = 3_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const s = await getStatus(pair);
    if (s?.gateway_is_proxy) return;
    await sleep(intervalMs);
  }
  throw new Error('Timed out waiting for gateway to recognize proxy');
}

export async function claimVaultForWallet(
  privateKey: string,
  name?: string,
  onProgress: (e: ClaimProgress) => void = () => {},
): Promise<{ vaultId: string }> {
  await cryptoWaitReady();

  const cleanHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const { sk } = getED25519Key(cleanHex);
  const seed = sk.slice(0, 32);
  const keyring = new Keyring({ type: 'ed25519' });
  const pair = keyring.addFromSeed(seed);

  // 1. Run onboarding (faucet → addProxy → poll).
  onProgress({ kind: 'checking-onboarding' });
  const initial = await getStatus(pair);
  if (initial && !initial.gateway_is_proxy) {
    if (initial.faucet_eligible || initial.ddc_seed_eligible) {
      onProgress({ kind: 'funding-wallet' });
      await bootstrap(pair);
    }
    const gatewayPubkey = await fetchGatewayPubkey();
    await submitAddProxy(pair, gatewayPubkey, onProgress);
    onProgress({ kind: 'waiting-for-proxy' });
    await pollUntilProxy(pair);
  }

  // 2. Claim the vault now that onboarding is done.
  onProgress({ kind: 'claiming-vault' });
  const wallet = await KeypairWallet.fromSeed(seed);
  const sdk = new VaultSDK({ endpoint: VAULT_API, wallet });
  const vault = await sdk.vault.ensure({ name, onboard: false });
  const rec = (vault as unknown as { record?: { vaultId: string } }).record;
  return { vaultId: rec?.vaultId ?? u8ToHex(pair.publicKey) };
}
