import Wallet from 'ethereumjs-wallet';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { decodeAddress, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { hexToU8a, isHex } from '@polkadot/util';

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

export const isValidAddress = (address: string, type: KeyType) =>
  type === 'ethereum' ? isEthereumAddress(address) : isValidPolkadotAddress(address);
