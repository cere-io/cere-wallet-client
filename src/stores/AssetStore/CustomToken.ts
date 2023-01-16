import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { createERC20Contract, TokenConfig } from '@cere-wallet/wallet-engine';

import { Asset, ReadyWallet } from '../types';

const createBalanceResource = ({ provider, network, account }: ReadyWallet, { decimals }: TokenConfig) => {
  let currentListener: () => {};

  const erc20 = createERC20Contract(provider.getSigner(), network.chainId);
  const receiveFilter = erc20.filters.Transfer(null, account.address);
  const sendFilter = erc20.filters.Transfer(account.address);

  return fromResource<number>(
    (sink) => {
      currentListener = async () => {
        const balance = await erc20.balanceOf(account.address);

        sink(balance.div(10 ** decimals).toNumber());
      };

      /**
       * Prefetch erc20 token balance
       */
      currentListener();

      /**
       * Update erc20 token balance on each transfer event
       */
      provider!.on(receiveFilter, currentListener);
      provider!.on(sendFilter, currentListener);
    },
    () => {
      provider!.off(receiveFilter, currentListener);
      provider!.off(sendFilter, currentListener);
    },
  );
};

export class CustomToken implements Asset {
  private tokenConfig: TokenConfig;

  private balanceResource;

  constructor(private wallet: ReadyWallet, asset: Asset) {
    makeAutoObservable(this);
    this.tokenConfig = {
      symbol: asset.ticker,
      decimals: asset.decimals || 0,
    };
    this.balanceResource = createBalanceResource(this.wallet, this.tokenConfig);
  }

  get displayName() {
    return this.tokenConfig.symbol;
  }

  get network() {
    return this.wallet.network.displayName;
  }

  get ticker() {
    return this.tokenConfig.symbol;
  }

  get balance() {
    return this.balanceResource.current();
  }
}
