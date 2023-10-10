import { makeObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { BigNumber, utils } from 'ethers';
import { createERC20Contract, TokenConfig } from '@cere-wallet/wallet-engine';

import { Asset, ReadyWallet } from '../types';

export const createBalanceResource = (
  { provider, account }: ReadyWallet,
  { decimals }: TokenConfig,
  tokenContractAddress: string,
) => {
  let currentListener: () => {};

  const erc20 = createERC20Contract(provider.getSigner(), tokenContractAddress);
  const receiveFilter = erc20.filters.Transfer(null, account.address);
  const sendFilter = erc20.filters.Transfer(account.address);

  return fromResource<number>(
    (sink) => {
      currentListener = async () => {
        const balance = await erc20.balanceOf(account.address);
        sink(balance.div(BigNumber.from(10).pow(decimals)).toNumber());
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

export class Erc20Token implements Asset {
  readonly tokenConfig: TokenConfig;
  readonly balanceResource;
  public id: string;
  public network?: string | undefined;
  public thumb?: string | undefined;
  public address: string;
  public decimals: number;

  constructor(private wallet: ReadyWallet, asset: Asset) {
    makeObservable(this, {
      balance: true,
    });

    this.tokenConfig = {
      symbol: asset.ticker,
      decimals: asset.decimals,
    };

    this.id = asset.id;
    this.address = asset.address!;
    this.thumb = asset.thumb;
    this.network = asset.network;
    this.decimals = asset.decimals;
    this.balanceResource = createBalanceResource(this.wallet, this.tokenConfig, this.address);
  }

  get displayName() {
    return this.tokenConfig.symbol.toLocaleUpperCase();
  }

  get ticker() {
    return this.tokenConfig.symbol;
  }

  get balance() {
    return this.balanceResource.current();
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
