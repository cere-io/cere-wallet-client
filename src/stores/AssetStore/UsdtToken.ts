import { ReadyWallet } from '../types';
import { Erc20Token } from './Erc20Token';

const usdtContractAddress: Record<string, string> = {
  '0x89': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon Mainnet
  '0x13881': '0x2f7b97837f2d14ba2ed3a4b2282e259126a9b848', // Polygon Testnet (Mumbai)
};

export class UsdtToken extends Erc20Token {
  constructor(wallet: ReadyWallet) {
    super(wallet, {
      id: 'matic-network',
      decimals: 6,
      displayName: 'USDT',
      ticker: 'USDT',
      address: usdtContractAddress[wallet.network.chainId],
    });
  }
}
