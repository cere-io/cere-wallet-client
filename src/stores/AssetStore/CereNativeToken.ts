import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { BN } from '@polkadot/util';
import { AccountInfo } from '@polkadot/types/interfaces';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { CERE_NETWORK_RPC } from '~/constants';
import { Asset, ReadyWallet } from '../types';

/**
 * To keep Cere Network support simple at first - we create the API instance here just to get the balance.
 *
 * TODO: Make the API globally available for other Cere Network related actions
 */
const createApi = () => {
  const provider = new WsProvider(CERE_NETWORK_RPC);

  return new ApiPromise({ provider });
};

export const convertBalance = (balance: BN, decimals: number) => {
  const bnDecimals = new BN(decimals);
  const divider = new BN(10).pow(bnDecimals);

  return balance.div(divider).toNumber();
};

const createBalanceResource = ({ accounts }: ReadyWallet) => {
  const api = createApi();
  const address = accounts.find((account) => account.type === 'ed25519')?.address;

  let unsubscribe: any;

  return fromResource<number>(
    async (sink) => {
      await api.isReady;

      unsubscribe = await api.query.system.account(address, ({ data }: AccountInfo) =>
        sink(convertBalance(data.free, 10)),
      );
    },
    () => {
      unsubscribe?.();
    },
  );
};

export class CereNativeToken implements Asset {
  private balanceResource = createBalanceResource(this.wallet);

  constructor(private wallet: ReadyWallet) {
    makeAutoObservable(this);
  }

  get id() {
    return 'cere-network';
  }

  get displayName() {
    return 'Cere';
  }

  get network() {
    return 'Cere Network';
  }

  get ticker() {
    return 'CERE';
  }

  get balance() {
    return this.balanceResource.current();
  }
}
