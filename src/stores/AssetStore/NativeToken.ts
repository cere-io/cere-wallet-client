import { providers, utils } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';

import { ReadyWallet, TransferableAsset } from './types';
import { DEFAULT_NETWORK } from '@cere-wallet/communication';

const BALANCE_CHECK_BLOCK_INTERVAL = 5;

const createBalanceResource = ({ provider }: ReadyWallet) => {
  let staticProvider: providers.StaticJsonRpcProvider | undefined;
  let address: string | undefined;
  let currentListener: (blockNumber?: number) => {};

  return fromResource<number>(
    (sink) => {
      currentListener = async (blockNumber?: number) => {
        if (blockNumber && blockNumber % BALANCE_CHECK_BLOCK_INTERVAL !== 0) {
          return;
        }
        // Cache address and provider to prevent refetching the signer each time
        if (!address) {
          const signer = provider.getSigner();
          address = await signer.getAddress();
        }

        if (!staticProvider) {
          staticProvider = new providers.StaticJsonRpcProvider(DEFAULT_NETWORK.host);
        }

        staticProvider = new providers.StaticJsonRpcProvider(DEFAULT_NETWORK.host);
        const balance = await staticProvider.getBalance(address);
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

export class NativeToken implements TransferableAsset {
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

  async transfer(to: string, amount: string) {
    const signer = this.wallet.provider.getSigner();
    const transaction = await signer.sendTransaction({
      to,
      value: utils.parseUnits(amount, this.decimals),
      gasLimit: 500000, // TODO: Use proper gasLimit value
    });

    return transaction.wait();
  }
}
