import { utils } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';

import { Asset, ReadyWallet } from '../types';

const createBalanceResource = ({ provider }: ReadyWallet) => {
  let currentListener: () => {};

  return fromResource<number>(
    (sink) => {
      currentListener = async () => {
        const balance = await provider.getSigner().getBalance();

        sink(+utils.formatEther(balance));
      };

      /**
       * Prefetch native balance
       */
      currentListener();

      /**
       * Update native balance on each new block
       */
      provider!.on('block', currentListener);
    },
    () => {
      provider!.off('block', currentListener);
    },
  );
};

export class NativeToken implements Asset {
  private balanceResource = createBalanceResource(this.wallet);

  constructor(private wallet: ReadyWallet) {
    makeAutoObservable(this);
  }

  get id() {
    return 'matic-network';
  }

  get decimals() {
    return 18;
  }

  get displayName() {
    return this.wallet.network.tickerName;
  }

  get network() {
    return this.wallet.network.displayName;
  }

  get ticker() {
    return this.wallet.network.ticker;
  }

  get balance() {
    return this.balanceResource.current();
  }
}
