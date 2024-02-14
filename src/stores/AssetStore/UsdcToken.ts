import { ContractName, getContractAddress } from '@cere-wallet/wallet-engine';

import { ReadyWallet } from './types';
import { Erc20Token } from './Erc20Token';

export class UsdcToken extends Erc20Token {
  constructor(wallet: ReadyWallet) {
    super(wallet, {
      id: 'matic-network',
      decimals: 18,
      displayName: 'USDC',
      ticker: 'USDC',
      address: getContractAddress(ContractName.ERC20Token, wallet.network.chainId),
      network: wallet.network.displayName,
    });
  }
}
