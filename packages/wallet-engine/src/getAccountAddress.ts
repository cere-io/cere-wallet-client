import Wallet from 'ethereumjs-wallet';
import { evmToAddress } from '@polkadot/util-crypto';

type AddressType = 'ethereum' | 'polkadot';

const addressMappers: Record<AddressType, (address: string) => string> = {
  ethereum: (address) => address,
  polkadot: (address) => evmToAddress(address),
};

export const convertAddress = (evmAddress: string, type: AddressType) => {
  return addressMappers[type](evmAddress);
};

export const getAccountAddress = (privateKey: string, type: AddressType = 'ethereum') => {
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const wallet = Wallet.fromPrivateKey(privateKeyBuffer);

  const evmAddress = wallet.getAddressString();

  return convertAddress(evmAddress, type);
};
