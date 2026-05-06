// Optional override: use an external Polkadot ed25519 keystore for vault
// API calls instead of the wallet's Web3Auth-derived ed25519. Devnet vaults
// are keyed to whichever pubkey claimed them, and during onboarding/demo the
// claim was performed from a separate JSON keystore (e.g. the
// `6Tsrt…3BQ`-style address from the GTM integration sheet).
//
// The override is held in module memory only — never localStorage — so a
// refresh forces the user to re-import. Good enough for the demo path.

import { Keyring } from '@polkadot/keyring';
import type { KeyringPair } from '@polkadot/keyring/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';

let pair: KeyringPair | null = null;
let listeners = new Set<() => void>();

export type VaultIdentity = {
  pair: KeyringPair;
  publicKeyHex: string;
};

export function getVaultIdentity(): VaultIdentity | null {
  if (!pair) return null;
  const pubBytes = pair.publicKey;
  let hex = '0x';
  for (let i = 0; i < pubBytes.length; i++) hex += pubBytes[i].toString(16).padStart(2, '0');
  return { pair, publicKeyHex: hex };
}

export function clearVaultIdentity() {
  pair = null;
  listeners.forEach((l) => l());
}

export function subscribeVaultIdentity(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Decrypt a Polkadot JSON keystore (`{encoded, encoding, address, meta}`)
 * with the user's passphrase, set it as the active vault identity, and
 * notify subscribers.
 */
export async function loadKeystore(json: any, passphrase: string): Promise<VaultIdentity> {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: 'ed25519' });
  const candidate = keyring.addFromJson(json);
  candidate.unlock(passphrase);
  pair = candidate;
  listeners.forEach((l) => l());
  return getVaultIdentity()!;
}
