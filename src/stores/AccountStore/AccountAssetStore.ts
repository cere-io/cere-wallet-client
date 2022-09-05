import { utils } from 'ethers';
import { createERC20Contract, getTokenConfig } from '@cere-wallet/wallet-engine';
import { makeAutoObservable, runInAction, when } from 'mobx';

import { Provider, Wallet } from '../types';

export type Asset = {
  ticker: string;
  displayName: string;
  balance: number;
};

export class AccountAssetStore {
  list: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    console.log({ wallet });

    when(
      () => !!wallet.provider,
      () => this.onProviderReady(wallet.provider!),
    );
  }

  get nativeToken() {
    return this.list.find(({ ticker }) => ticker === 'matic'); // TODO: Properly detect native token
  }

  private async onProviderReady(provider: Provider) {
    console.log('onProviderReady');
    const { symbol, decimals } = getTokenConfig();

    const signer = provider.getSigner();
    const chainId = await signer.getChainId();
    const address = await signer.getAddress();

    const nativeBalance = await signer.getBalance();

    const erc20 = createERC20Contract(signer, chainId.toString(16));
    const erc20Balance = await erc20.balanceOf(address);

    runInAction(() => {
      this.list = [
        {
          ticker: 'matic',
          displayName: 'Matic',
          balance: +utils.formatEther(nativeBalance),
        },
        {
          ticker: symbol.toLocaleLowerCase(),
          displayName: symbol,
          balance: erc20Balance.div(10 ** decimals).toNumber(),
        },
      ];
    });
  }
}
