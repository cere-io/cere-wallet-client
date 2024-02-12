import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { BigNumber, BigNumberish, utils } from 'ethers';
import { ContractName, createERC20Contract, getContractAddress } from '@cere-wallet/wallet-engine';

import { TransferableAsset, ReadyWallet } from './types';
import { getStaticProvider } from '@cere-wallet/communication';

export const convertBalance = (balance: BigNumberish, decimals: BigNumberish) => {
  const divider = BigNumber.from(10).pow(decimals);
  const bnBalance = BigNumber.from(balance);

  return bnBalance.div(divider).toNumber();
};

const createBalanceResource = ({ engine }: ReadyWallet, decimals: BigNumberish) => {
  let updateBalance: (...args: any) => void;

  return fromResource<number>(
    async (sink) => {
      updateBalance = ({ balance }) => sink(convertBalance(balance, decimals));

      engine.provider.on('eth_balanceChanged', updateBalance);
    },
    () => {
      engine.provider.off('eth_balanceChanged', updateBalance);
    },
  );
};

export class CereErc20Token implements TransferableAsset {
  private balanceResource = createBalanceResource(this.wallet, this.decimals);

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
    return this.wallet.network.displayName;
  }

  get ticker() {
    return 'CERE_ERC20';
  }

  get decimals() {
    return 10;
  }

  get balance() {
    return this.balanceResource.current();
  }

  async transfer(to: string, amount: string) {
    const chainId = this.wallet.network.chainId;
    const signer = getStaticProvider(this.wallet.provider).getUncheckedSigner();
    const contract = createERC20Contract(signer, getContractAddress(ContractName.CereToken, chainId));

    const transaction = await contract.transfer(to, utils.parseUnits(amount, this.decimals), {
      gasLimit: 500000, // TODO: Use proper gasLimit value
    });

    return transaction.wait();
  }
}
