import { makeAutoObservable } from 'mobx';

import { PriceData, Wallet } from '../types';

type Activity = {
  hash: string;
  asset: string;
  flow: PriceData;
  date: Date;
} & (
  | {
      type: 'in';
      from: string;
    }
  | {
      type: 'out';
      to: string;
    }
);

export class ActivityStore {
  constructor(wallet: Wallet) {
    makeAutoObservable(this);
  }

  get list(): Activity[] {
    return [];

    // return [
    //   {
    //     hash: '1',
    //     type: 'out',
    //     asset: 'usdc',
    //     date: new Date(),
    //     to: '0x00000000000000000000000000000',
    //     flow: {
    //       amount: 10,
    //       symbol: 'USDC',
    //       equalsTo: {
    //         amount: 10,
    //         symbol: 'USD',
    //       },
    //     },
    //   },
    //   {
    //     hash: '2',
    //     type: 'in',
    //     asset: 'matic',
    //     date: new Date(),
    //     from: '0x00000000000000000000000000000',
    //     flow: {
    //       amount: 222,
    //       symbol: 'USDC',
    //       equalsTo: {
    //         amount: 1000,
    //         symbol: 'USD',
    //       },
    //     },
    //   },
    // ];
  }
}
