import Wallet from 'ethereumjs-wallet';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { encodeAddress } from '@polkadot/util-crypto';

import { KeyPair, KeyType } from './types';

const pairFactoryMap: Record<KeyType, (privateKey: string) => KeyPair> = {
  ethereum: (privateKey) => {
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));

    return {
      type: 'ethereum',
      address: wallet.getAddressString(),
      secretKey: wallet.getPrivateKey().toString('hex'),
    };
  },

  ed25519: (privateKey) => {
    const { pk, sk } = getED25519Key(privateKey);

    return {
      type: 'ed25519',
      address: encodeAddress(pk),
      secretKey: sk.toString('hex'),
    };
  },
};

export const getKeyPair = (privateKey: string, type: KeyType = 'ethereum') => {
  return pairFactoryMap[type](privateKey);
};

export const getAccountAddress = (privateKey: string, type: KeyType = 'ethereum') => {
  return getKeyPair(privateKey, type).address;
};
