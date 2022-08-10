import Wallet from 'ethereumjs-wallet';

export const getAccountAddress = (privateKey: string) => {
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const wallet = Wallet.fromPrivateKey(privateKeyBuffer);

  return wallet.getAddressString();
};
