import { createERC20Contract, createUSDCContract, getTokenConfig } from '@cere-wallet/wallet-engine';
import { BigNumber, utils } from 'ethers';

import { ReadyWallet } from '../types';
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
  value: BigNumber;
};

export class CustomToken {
  private tokenConfig = getTokenConfig();
  private interface?: utils.Interface;
  private dispose?: () => void;

  constructor(private activityStore: ActivityStore) {}

  start({ provider, account }: ReadyWallet, tokenAddress: string) {
    const erc20 = createERC20Contract(provider.getSigner(), tokenAddress);
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
    const { symbol, decimals } = this.tokenConfig;
    const { transactionHash } = log;
    const { from, to, value } = this.interface!.parseLog(log).args as Args;
    const amount = value.div(10 ** decimals).toNumber();

    return {
      type,
      to,
      from,
      asset: symbol,
      flow: {
        amount,
        symbol,
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
