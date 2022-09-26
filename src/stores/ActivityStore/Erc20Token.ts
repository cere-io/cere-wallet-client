import { createERC20Contract, getTokenConfig } from '@cere-wallet/wallet-engine';
import { BigNumber, utils } from 'ethers';

import { Wallet } from '../types';
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

export class Erc20Token {
  private tokenConfig = getTokenConfig();
  private interface: utils.Interface;

  constructor(private activityStore: ActivityStore, { provider, network, account }: Wallet) {
    const erc20 = createERC20Contract(provider!.getSigner(), network!.chainId);
    const receiveFilter = erc20.filters.Transfer(null, account!.address);
    const sendFilter = erc20.filters.Transfer(account!.address);

    provider!.on(receiveFilter, (log) => this.onReceive(log));
    provider!.on(sendFilter, (log) => this.onSend(log));

    this.interface = erc20.interface;
  }

  private createActivity(type: Activity['type'], log: Log): Activity {
    const { symbol, decimals } = this.tokenConfig;
    const { transactionHash } = log;
    const { from, to, value } = this.interface.parseLog(log).args as Args;
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

  private onReceive(log: Log) {
    const activity = this.createActivity('in', log);

    this.activityStore.addActivity(activity);
  }

  private onSend(log: Log) {
    const activity = this.createActivity('out', log);

    this.activityStore.addActivity(activity);
  }
}
