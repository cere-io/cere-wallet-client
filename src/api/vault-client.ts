// Vault SDK client. Auth is per-request raw-bytes ed25519 signing
// (X-Public-Key / X-Signature / X-Signed-Preamble headers) — JWT is NOT used.
// We build a local Polkadot keyring pair from the active identity and sign
// with it. The active identity is either the wallet's Web3Auth-derived
// ed25519 seed OR an override loaded from a JSON keystore (vault-identity.ts).

import { Vault } from '@cef-ai/client-sdk';
import { Keyring } from '@polkadot/keyring';
import type { KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex, stringToU8a } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { getVaultIdentity } from './vault-identity';

export const VAULT_BASE_URL = 'https://vault-api.compute.dev.ddcdragon.com';

let cachedClient: Vault | null = null;
let cachedForKey: string | null = null;

function buildClientFromPair(pair: KeyringPair): Vault {
  const publicKey = u8aToHex(pair.publicKey);
  const wallet = {
    publicKey,
    sign: async (text: string): Promise<string> => u8aToHex(pair.sign(stringToU8a(text))),
    signRawBytes: async (bytes: Uint8Array): Promise<string> => u8aToHex(pair.sign(bytes)),
  } as unknown as ConstructorParameters<typeof Vault>[0]['wallet'];

  return new Vault({ url: VAULT_BASE_URL, wallet });
}

/**
 * Build (or reuse) a Vault client signed by the active identity. If a vault
 * keystore override is set (Settings → Use external vault identity), that
 * pair is used; otherwise we fall back to deriving from the wallet's
 * Web3Auth privKey. Memoized on the active identity's pubkey.
 */
export async function getVaultClient(privateKey: string): Promise<Vault> {
  await cryptoWaitReady();

  const override = getVaultIdentity();
  if (override) {
    if (cachedClient && cachedForKey === override.publicKeyHex) return cachedClient;
    cachedClient = buildClientFromPair(override.pair);
    cachedForKey = override.publicKeyHex;
    return cachedClient;
  }

  const cleanHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  if (cachedClient && cachedForKey === cleanHex) return cachedClient;

  const { sk } = getED25519Key(cleanHex);
  const seed = sk.slice(0, 32);
  const keyring = new Keyring({ type: 'ed25519' });
  const pair = keyring.addFromSeed(seed);

  cachedClient = buildClientFromPair(pair);
  cachedForKey = cleanHex;
  return cachedClient;
}

export function invalidateVaultClient() {
  cachedClient = null;
  cachedForKey = null;
}
