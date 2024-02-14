import { ReadyWallet } from './types';
import { Erc20Token } from './Erc20Token';
import { ContractName, getContractAddress } from '@cere-wallet/wallet-engine';

export class CereErc20Token extends Erc20Token {
  constructor(wallet: ReadyWallet) {
    super(wallet, {
      id: 'cere-network',
      decimals: 10,
      displayName: 'Cere',
      ticker: 'CERE_ERC20',
      address: getContractAddress(ContractName.CereToken, wallet.network.chainId),
      network: wallet.network.displayName,
    });
  }
}
