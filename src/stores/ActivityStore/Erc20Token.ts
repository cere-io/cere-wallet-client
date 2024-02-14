import { createERC20Contract } from '@cere-wallet/wallet-engine';
import { BigNumberish, utils } from 'ethers';

import { Asset, ReadyWallet } from '../types';
import { Activity, ActivityStore } from './ActivityStore';

type Log = {
  address: string;
  transactionHash: string;
  topics: Array<string>;
  data: string;
};

type Args = utils.Result & {
  from: string;
  to: string;
  value: BigNumberish;
};

export class Erc20Token {
  private interface?: utils.Interface;
  private dispose?: () => void;

  constructor(
    private activityStore: ActivityStore,
    private asset: Pick<Asset, 'address' | 'displayName' | 'decimals'>,
  ) {}

  start({ provider, account }: ReadyWallet) {
    if (!this.asset.address) {
      throw new Error('Asset address is not defined');
    }

    const erc20 = createERC20Contract(provider.getSigner(), this.asset.address);
    const receiveFilter = erc20.filters.Transfer(null, account.address);
    const sendFilter = erc20.filters.Transfer(account.address);

    provider.on(receiveFilter, this.onReceive);
    provider.on(sendFilter, this.onSend);

    this.interface = erc20.interface;

    this.dispose = () => {
      provider.off(receiveFilter, this.onReceive);
      provider.off(sendFilter, this.onSend);
    };
  }

  stop() {
    this.dispose?.();

    this.interface = undefined;
    this.dispose = undefined;
  }

  private createActivity(type: Activity['type'], log: Log): Activity {
    const { displayName, decimals } = this.asset;
    const { transactionHash } = log;
    const { from, to, value } = this.interface!.parseLog(log).args as Args;
    const amount = +utils.formatUnits(value, decimals);

    return {
      type,
      to,
      from,
      asset: displayName,
      flow: {
        amount,
        symbol: displayName,
        equalsTo: {
          amount,
          symbol: 'USD',
        },
      },
      hash: transactionHash,
      date: new Date().toDateString(),
    };
  }

  private onReceive = (log: Log) => {
    const activity = this.createActivity('in', log);

    this.activityStore.addActivity(activity);
  };

  private onSend = (log: Log) => {
    const activity = this.createActivity('out', log);

    this.activityStore.addActivity(activity);
  };
}
