import { Signer, utils } from 'ethers';
import { makeAutoObservable, when } from 'mobx';
import { createERC20Contract, getTokenConfig } from '@cere-wallet/wallet-engine';

import { Provider, Wallet, Asset } from '../types';

const getErc20Balance = async (signer: Signer, chainId: string, address: string) => {
  const { decimals } = getTokenConfig();
  const erc20 = createERC20Contract(signer, chainId);
  const balance = await erc20.balanceOf(address);

  return balance.div(10 ** decimals).toNumber();
};

const getNativeBalance = async (signer: Signer) => {
  const balance = await signer.getBalance();

  return +utils.formatEther(balance);
};

export class AssetStore {
  readonly list: Asset[];

  private tokenConfig = getTokenConfig();

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    this.list = [
      {
        ticker: 'matic',
        displayName: 'Matic',
        network: 'Polygon',
      },

      {
        ticker: this.tokenConfig.symbol,
        displayName: this.tokenConfig.symbol,
        network: 'Polygon',
      },
    ];

    when(
      () => !!wallet.provider,
      () => this.onProviderReady(wallet.provider!),
    );
  }

  get nativeToken() {
    return this.list.find(({ ticker }) => ticker === 'matic'); // TODO: Properly detect native token
  }

  private async onProviderReady(provider: Provider) {
    const { chainId } = this.wallet.network!;
    const { address } = this.wallet.account!;

    const signer = provider.getSigner();

    getNativeBalance(signer).then((balance) => {
      this.updateBalance(this.nativeToken!.ticker, balance);
    });

    getErc20Balance(signer, chainId, address).then((balance) => {
      this.updateBalance(this.tokenConfig.symbol, balance);
    });
  }

  private updateBalance(ticker: string, balance: number) {
    const asset = this.list.find((asset) => asset.ticker === ticker);

    if (asset) {
      asset.balance = balance;
    }
  }
}
