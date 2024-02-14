import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { utils } from 'ethers';

import { TransferableAsset, ReadyWallet } from './types';

const createBalanceResource = ({ engine }: ReadyWallet, address: string, decimals: number) => {
  let updateBalance: (...args: any) => void;

  return fromResource<number>(
    async (sink) => {
      updateBalance = ({ balance }) => sink(+utils.formatUnits(balance, decimals));

      engine.provider.on('ed25519_balanceChanged', updateBalance);
    },
    () => {
      engine.provider.off('ed25519_balanceChanged', updateBalance);
    },
  );
};

export class CereNativeToken implements TransferableAsset {
  private balanceResource = createBalanceResource(this.wallet, this.accountAddress, this.decimals);

  constructor(private wallet: ReadyWallet) {
    makeAutoObservable(this);
  }

  private get accountAddress() {
    return this.wallet.accounts.find((account) => account.type === 'ed25519')!.address;
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

  get decimals() {
    return 10;
  }

  get balance() {
    return this.balanceResource.current();
  }

  async transfer(to: string, value: string) {
    const amount = utils.parseUnits(value, this.decimals);

    return this.wallet.provider.send('ed25519_transfer', [this.accountAddress, to, amount.toString()]);
  }
}
