import { useWalletStore } from './useWalletStore';
import { createERC20Contract } from '@cere/wallet-engine';
import { ethers } from 'ethers';
import { ContractReceipt } from '@ethersproject/contracts/src.ts';

export const useTransactionStore = () => {
  const walletStore = useWalletStore();

  const transferErc20 = async (ticker: string, address: string, amount: string): Promise<ContractReceipt> => {
    const networkTiker = walletStore.network?.ticker;
    if (![networkTiker, 'USDC'].includes(ticker)) {
      throw new Error(`transfer is not working for asset ${ticker}`);
    }
    if (ticker === networkTiker) {
      return transferNativeToken(address, amount);
    }
    return transferUSDC(address, amount);
  };

  const transferNativeToken = async (address: string, amount: string): Promise<ContractReceipt> => {
    const signer = walletStore.provider?.getSigner()!;
    const transaction = await signer.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount),
    });
    console.log('transaction', transaction);
    const result = await transaction.wait();
    console.log('transaction result', result);
    return result;
  };

  const transferUSDC = async (address: string, amount: string): Promise<ContractReceipt> => {
    const chainId = walletStore?.network?.chainId || '';

    const contract = createERC20Contract(walletStore?.provider?.getSigner()!, chainId);
    const currentGasPrice = await walletStore.provider?.getGasPrice();
    const decimals = await contract.decimals();
    const numberOfTokens = ethers.utils.parseUnits(amount, decimals);
    const transaction = await contract.transfer(address, numberOfTokens, {
      gasPrice: currentGasPrice,
      gasLimit: 500000, // FIXME
    });
    console.log('transaction', transaction);
    const result = await transaction.wait();
    console.log('transaction result', result);
    return result;
  };

  return { transferErc20 };
};
