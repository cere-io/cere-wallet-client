import { utils } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { createUSDCContract, getTokenConfig, TokenConfig } from '@cere-wallet/wallet-engine';

import { TransferableAsset, ReadyWallet } from './types';

const createBalanceResource = ({ provider, network, account }: ReadyWallet, { decimals }: TokenConfig) => {
  let currentListener: () => {};

  const erc20 = createUSDCContract(provider.getSigner(), network.chainId);
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

export class Erc20Token implements TransferableAsset {
  private tokenConfig = getTokenConfig();
  private balanceResource = createBalanceResource(this.wallet, this.tokenConfig);
  public id: string = 'matic-network';

  constructor(private wallet: ReadyWallet) {
    makeAutoObservable(this);
  }

  get decimals() {
    return this.tokenConfig.decimals;
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

  get decimals() {
    return this.tokenConfig.decimals;
  }

  get balance() {
    return this.balanceResource.current();
  }

  async transfer(to: string, amount: string) {
    const chainId = this.wallet.network.chainId;
    const signer = this.wallet.provider.getUncheckedSigner();
    const contract = createERC20Contract(signer, chainId);

    const transaction = await contract.transfer(to, utils.parseUnits(amount, this.decimals), {
      gasLimit: 500000, // TODO: Use proper gasLimit value
    });

    return transaction.wait();
  }
}
