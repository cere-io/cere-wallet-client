import { makeObservable } from 'mobx';
import { ILazyObservable, fromResource, lazyObservable } from 'mobx-utils';
import { utils, BigNumber } from 'ethers';
import { createERC20Contract, ERC20Contract } from '@cere-wallet/wallet-engine';

import { Asset, ReadyWallet } from '../types';

export const createBalanceResource = ({ account, provider }: ReadyWallet, erc20: ERC20Contract) => {
  let currentListener: () => {};

  const receiveFilter = erc20.filters.Transfer(null, account.address);
  const sendFilter = erc20.filters.Transfer(account.address);

  return fromResource<BigNumber>(
    (sink) => {
      currentListener = async () => {
        sink(await erc20.balanceOf(account.address));
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

type Erc20Asset = Omit<Asset, 'decimals'> & {
  decimals?: number;
};

export class Erc20Token implements Asset {
  protected balanceResource;
  protected contract: ERC20Contract;
  protected decimalsObservable: ILazyObservable<number | undefined>;

  constructor(private wallet: ReadyWallet, private asset: Erc20Asset) {
    makeObservable(this, {
      balance: true,
      decimals: true,
    });

    const signer = this.wallet.provider.getUncheckedSigner();

    this.contract = createERC20Contract(signer, this.address);
    this.balanceResource = createBalanceResource(this.wallet, this.contract);
    this.decimalsObservable = lazyObservable((sink) =>
      asset.decimals ? sink(asset.decimals) : this.contract.decimals().then(sink),
    );
  }

  get id() {
    return this.asset.id;
  }

  get ticker() {
    return this.asset.ticker;
  }

  get displayName() {
    return this.asset.displayName;
  }

  get decimals() {
    return this.decimalsObservable.current() || 0;
  }

  get address() {
    if (!this.asset.address) {
      throw new Error('ERC20 asset address is required');
    }

    return this.asset.address!;
  }

  get thumb() {
    return this.asset.thumb;
  }

  get network() {
    return this.asset.network;
  }

  get balance() {
    const balance = this.balanceResource.current();

    return balance && this.decimals ? +utils.formatUnits(balance, this.decimals) : undefined;
  }

  async transfer(to: string, amount: string) {
    const signer = this.wallet.provider.getUncheckedSigner();
    const contract = createERC20Contract(signer, this.address);

    const transaction = await contract.transfer(to, utils.parseUnits(amount, this.decimals), {
      gasLimit: 500000, // TODO: Use proper gasLimit value
    });

    return transaction.wait();
  }
}
