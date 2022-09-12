import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { createERC20Contract, getTokenConfig, TokenConfig } from '@cere-wallet/wallet-engine';

import { Asset, Wallet } from '../types';

const createBalanceResource = ({ provider, network, account }: Wallet, { decimals }: TokenConfig) => {
  let currentListener: () => {};

  const erc20 = createERC20Contract(provider!.getSigner(), network!.chainId);
  const eventFilter = erc20.filters.Transfer(null, account!.address);

  return fromResource<number>(
    (sink) => {
      currentListener = async () => {
        const balance = await erc20.balanceOf(account!.address);

        sink(balance.div(10 ** decimals).toNumber());
      };

      /**
       * Prefetch erc20 token balance
       */
      currentListener();

      /**
       * Update erc20 token balance on each transfer event
       */
      provider!.on(eventFilter, currentListener);
    },
    () => {
      provider!.off(eventFilter, currentListener);
    },
  );
};

export class Erc20Token implements Asset {
  private tokenConfig = getTokenConfig();
  private balanceResource = createBalanceResource(this.wallet, this.tokenConfig);

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
  }

  get displayName() {
    return this.tokenConfig.symbol;
  }

  get network() {
    return this.wallet.network!.displayName;
  }

  get ticker() {
    return this.tokenConfig.symbol;
  }

  get balance() {
    return this.balanceResource.current();
  }
}
