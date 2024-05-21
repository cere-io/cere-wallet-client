import Wallet from 'ethereumjs-wallet';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { decodeAddress, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { hexToU8a, isHex } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';
import { Keypair as SolKeypair } from '@solana/web3.js';

import { KeyPair, KeyType, Account } from './types';
import { CERE_SS58_PREFIX } from './constants';

const pairFactoryMap: Record<KeyType, (privateKey: string) => KeyPair> = {
  ethereum: (privateKey) => {
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));

    return {
      type: 'ethereum',
      publicKey: wallet.getPublicKey(),
      secretKey: wallet.getPrivateKey(),
      address: wallet.getAddressString(),
    };
  },

  ed25519: (privateKey) => {
    const { pk: publicKey, sk: secretKey } = getED25519Key(privateKey);

    return {
      type: 'ed25519',
      publicKey,
      secretKey,
      address: encodeAddress(publicKey, CERE_SS58_PREFIX),
    };
  },

  solana: (privateKey) => {
    const { sk: ed25519Key } = getED25519Key(privateKey);
    const { publicKey, secretKey } = SolKeypair.fromSecretKey(ed25519Key);

    return {
      type: 'solana',
      publicKey: publicKey.toBuffer(),
      secretKey: Buffer.from(secretKey),
      address: publicKey.toBase58(),
    };
  },
};

export type KeyPairOptions = {
  privateKey: string;
  type: KeyType;
};

export type AccountOptions = KeyPairOptions & {
  name: string;
};

export const getKeyPair = ({ privateKey, type }: KeyPairOptions): KeyPair => {
  return pairFactoryMap[type](privateKey);
};

export const exportAccountToJson = ({ privateKey, type, passphrase }: KeyPairOptions & { passphrase?: string }) => {
  if (type === 'solana') {
    throw new Error('Not implemented');
  }

  const { publicKey, secretKey } = getKeyPair({ type, privateKey });
  const keyring = new Keyring({ type });

  return keyring.addFromPair({ publicKey, secretKey }).toJson(passphrase);
};

export const getAccount = ({ privateKey, type, name }: AccountOptions): Account => ({
  type,
  name,
  address: getKeyPair({ privateKey, type }).address,
});

const isValidPolkadotAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch {
    return false;
  }
};

export const isValidAddress = (address: string, type: KeyType) => {
  if (type === 'solana') {
    throw new Error('Not implemented');
  }

  return type === 'ethereum' ? isEthereumAddress(address) : isValidPolkadotAddress(address);
};
