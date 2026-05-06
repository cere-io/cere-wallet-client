import { entropyToMnemonic } from 'bip39';
import { encodeAddress } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { Keypair as SolKeypair } from '@solana/web3.js';
import Wallet from 'ethereumjs-wallet';

// Inline base58 encoder — avoids bs58 dep (the v5/v6 CJS/ESM split breaks CRA's
// source-map-loader). This is ~12 lines and well-tested by usage in @solana/web3.js.
const BS58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(bytes: Uint8Array): string {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits: number[] = [];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = '';
  for (let i = 0; i < zeros; i++) out += '1';
  for (let i = digits.length - 1; i >= 0; i--) out += BS58_ALPHABET[digits[i]];
  return out;
}

const CERE_SS58_PREFIX = 54;

export type RevealedKeys = {
  mnemonic: string; // 24-word BIP39, derived from the Web3Auth root privKey entropy
  rootPrivateKeyHex: string; // 0x-prefixed
  cere: {
    address: string;
    secretHex: string; // 0x-prefixed ed25519 secret (64 bytes)
    suri: string; // Polkadot SURI form for use with subkey / polkadot.js
  };
  evm: {
    address: string;
    privateKeyHex: string; // 0x-prefixed secp256k1
  };
  solana: {
    address: string;
    secretBase58: string; // base58 64-byte secretKey accepted by Phantom etc.
  };
};

export function deriveAllKeys(privateKey: string): RevealedKeys {
  const cleanHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const mnemonic = entropyToMnemonic(cleanHex);

  const evmWallet = Wallet.fromPrivateKey(Buffer.from(cleanHex, 'hex'));
  const evm = {
    address: evmWallet.getAddressString(),
    privateKeyHex: '0x' + cleanHex,
  };

  const { pk: cerePub, sk: cereSec } = getED25519Key(cleanHex);
  const cere = {
    address: encodeAddress(cerePub, CERE_SS58_PREFIX),
    secretHex: '0x' + Buffer.from(cereSec).toString('hex'),
    // Polkadot's SURI accepts a hex-prefixed seed directly for ed25519
    suri: '0x' + Buffer.from(cereSec.slice(0, 32)).toString('hex'),
  };

  const sol = SolKeypair.fromSecretKey(cereSec);
  const solana = {
    address: sol.publicKey.toBase58(),
    secretBase58: base58Encode(sol.secretKey),
  };

  return {
    mnemonic,
    rootPrivateKeyHex: '0x' + cleanHex,
    cere,
    evm,
    solana,
  };
}

// Touch Keyring import so tree-shaking keeps it (we may use it later for
// SURI verification — leaving the dependency anchored).
export const _keepKeyring = Keyring;
