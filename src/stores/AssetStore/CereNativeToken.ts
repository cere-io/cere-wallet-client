import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { BN } from '@polkadot/util';
import { AccountInfo } from '@polkadot/types/interfaces';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { CERE_NETWORK_RPC } from '~/constants';
import { TransferableAsset, ReadyWallet } from './types';

/**
 * To keep Cere Network support simple at first - we create the API instance here just to get the balance.
 *
 * TODO: Make the API globally available for other Cere Network related actions
 */
const createApi = () => {
  const provider = new WsProvider(CERE_NETWORK_RPC);

  return new ApiPromise({ provider });
};

export const convertBalance = (balance: BN, decimals: BN) => {
  const divider = new BN(10).pow(decimals);

  return balance.div(divider).toNumber();
};

const createBalanceResource = (api: ApiPromise, address: string, decimals: BN) => {
  let unsubscribe: any;

  return fromResource<number>(
    async (sink) => {
      await api.isReady;

      unsubscribe = await api.query.system.account(address, ({ data }: AccountInfo) =>
        sink(convertBalance(data.free, decimals)),
      );
    },
    () => {
      unsubscribe?.();
    },
  );
};

export class CereNativeToken implements TransferableAsset {
  private api = createApi();
  private balanceResource = createBalanceResource(this.api, this.accountAddress, new BN(this.decimals));

  constructor(private wallet: ReadyWallet) {
    makeAutoObservable(this);
  }

  private get accountAddress() {
    return this.wallet.accounts.find((account) => account.type === 'ed25519')!.address;
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

  get decimals() {
    return 10;
  }

  get balance() {
    return this.balanceResource.current();
  }

  async transfer(to: string, value: string) {
    const decimals = new BN(this.decimals);
    const multiple = new BN(10).pow(decimals);
    const amount = new BN(value).mul(multiple);

    return this.api.tx.balances.transfer(to, amount).signAndSend(this.accountAddress, {
      signer: {
        signRaw: async (raw) => {
          const signature = await this.wallet.provider.send('ed25519_sign', [raw.address, raw.data]);

          return { id: 0, signature };
        },
      },
    });
  }
}
