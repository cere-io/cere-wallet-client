import { useWalletStore } from './useWalletStore';
import { createERC20Contract } from '@cere/wallet-engine';
import { ethers } from 'ethers';

export const useTransactionStore = () => {
  const walletStore = useWalletStore();

  const transfer = async (ticker: string, address: string, amount: string) => {
    const networkTiker = walletStore.network?.ticker;

    return ticker === networkTiker ? transferNativeToken(address, amount) : transferUSDC(address, amount);
  };

  const transferNativeToken = async (address: string, amount: string) => {
    const signer = walletStore.provider?.getSigner()!;
    const transaction = await signer.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount),
      gasLimit: 500000, // TODO: Use proper gasLimit value
    });

    return transaction.wait();
  };

  const transferUSDC = async (address: string, amount: string) => {
    const chainId = walletStore?.network?.chainId || '';
    const contract = createERC20Contract(walletStore?.provider?.getUncheckedSigner()!, chainId);

    const decimals = await contract.decimals();
    const transaction = await contract.transfer(address, ethers.utils.parseUnits(amount, decimals), {
      gasLimit: 500000, // TODO: Use proper gasLimit value
    });

    return transaction.wait();
  };

  return { transfer };
};
