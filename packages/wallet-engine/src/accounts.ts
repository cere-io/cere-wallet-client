import { encodeAddress } from '@polkadot/util-crypto';
import { getED25519Key } from '@toruslabs/openlogin-ed25519';
import Wallet from 'ethereumjs-wallet';
import { Account, KeyPair, KeyType } from './types';

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

export const getAccountAddress = ({ privateKey, type }: KeyPairOptions) => getKeyPair({ privateKey, type }).address;
