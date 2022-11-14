import Wallet from 'ethereumjs-wallet';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import { encodeAddress } from '@polkadot/util-crypto';

import { KeyPair, KeyType, Account } from './types';

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
      address: encodeAddress(publicKey),
    };
  },
};

export const getKeyPair = (privateKey: string, type: KeyType = 'ethereum'): KeyPair => {
  return pairFactoryMap[type](privateKey);
};

export const getAccount = (privateKey: string, type: KeyType = 'ethereum'): Account => ({
  type,
  address: getKeyPair(privateKey, type).address,
});

export const getAccountAddress = (privateKey: string, type: KeyType = 'ethereum') =>
  getAccount(privateKey, type).address;
