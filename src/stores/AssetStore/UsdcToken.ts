import { ContractName, getContractAddress, getERC20TokenConfig } from '@cere-wallet/wallet-engine';

import { ReadyWallet } from './types';
import { Erc20Token } from './Erc20Token';

export class UsdcToken extends Erc20Token {
  constructor(wallet: ReadyWallet) {
    const { decimals, symbol } = getERC20TokenConfig();

    super(wallet, {
      id: 'matic-network',
      decimals,
      displayName: symbol,
      ticker: symbol,
      address: getContractAddress(ContractName.ERC20Token, wallet.network.chainId),
      network: wallet.network.displayName,
    });
  }
}
