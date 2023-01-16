import { makeAutoObservable, runInAction, when } from 'mobx';
import { BigNumber } from 'ethers';
import {
  PersonalSignRequest,
  SendTransactionRequest,
  ContractName,
  parseTransactionData,
  getTokenConfig,
  TokenConfig,
} from '@cere-wallet/wallet-engine';

import { Wallet } from '../types';
import { PopupManagerStore } from '../PopupManagerStore';
import { NetworkStore } from '../NetworkStore';
import { TransactionPopupState } from '../TransactionPopupStore';
import { ConfirmPopupState } from '../ConfirmPopupStore';
import { AppContextStore } from '../AppContextStore';

type ApproveTransactionOptions = {
  showDetails?: boolean;
};

const convertPrice = (amount: BigNumber, { decimals }: TokenConfig) => {
  return amount.div(10 ** decimals).toNumber();
};

export class ApprovalStore {
  constructor(
    private wallet: Wallet,
    private popupManagerStore: PopupManagerStore,
    private networkStore: NetworkStore,
    private contextStore: AppContextStore,
  ) {
    makeAutoObservable(this);
  }

  async approvePersonalSign({ preopenInstanceId, params: [content] }: PersonalSignRequest) {
    const tokenConfig = getTokenConfig();
    const instanceId = preopenInstanceId || this.popupManagerStore.createModal();
    const popup = await this.popupManagerStore.proceedTo<ConfirmPopupState>(instanceId, '/confirm', {
      network: this.networkStore.network,
      app: this.contextStore.app,
      status: 'pending',
      content,
      fee: { amount: 0, symbol: tokenConfig.symbol }, // TODO: Detect gas fee
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(instanceId);

    if (!popup.isConnected) {
      throw new Error('User has closed the confirmation popup');
    }

    if (popup.state.status === 'declined') {
      throw new Error('User has declined the signing request');
    }
  }

  async approveSendTransaction(
    { preopenInstanceId, proceed, params: [transaction] }: SendTransactionRequest,
    { showDetails = false }: ApproveTransactionOptions = {},
  ) {
    const tokenConfig = getTokenConfig();
    const network = this.networkStore.network!;
    const { contractName, description: parsedData } = parseTransactionData(transaction, network.chainId);
    const instanceId = preopenInstanceId || this.popupManagerStore.createModal();
    const popup = await this.popupManagerStore.proceedTo<TransactionPopupState>(instanceId, '/transaction', {
      network,
      parsedData,
      status: 'pending',
      step: 'confirmation',
      from: transaction.from,
      to: transaction.to,
      rawData: transaction.data,
      action: parsedData?.name,
      app: this.contextStore.app,
    });

    runInAction(() => {
      if (contractName === ContractName.Freeport) {
        const { name, args } = parsedData;

        if (name === 'takeOffer') {
          const price = convertPrice(args.expectedPriceOrZero, tokenConfig);
          const amount = (args.amount as BigNumber).toNumber();
          const sum = amount * price;

          popup.state.spending = {
            fee: { symbol: tokenConfig.symbol, amount: 0 }, // TODO: Detect gas fee

            price: {
              symbol: tokenConfig.symbol,
              amount: sum,
              equalsTo: {
                amount: sum,
                symbol: 'USD',
              },
            },

            total: {
              symbol: tokenConfig.symbol,
              amount: sum,
              equalsTo: {
                amount: sum,
                symbol: 'USD',
              },
            },
          };
        }
      }

      if (contractName === ContractName.ERC20) {
        const { name, args } = parsedData;

        if (name === 'approve') {
          popup.state.toConfirm = {
            symbol: tokenConfig.symbol,
            amount: convertPrice(args.amount, tokenConfig),
          };
        }
      }
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);

    if (!popup.isConnected || popup.state.status === 'declined') {
      this.popupManagerStore.closePopup(instanceId);

      throw new Error(
        popup.isConnected ? 'User has declined the transaction request' : 'User has closed the confirmation popup',
      );
    }

    if (showDetails) {
      const { result: transactionId } = await proceed();

      runInAction(() => {
        popup.state.step = 'details';
        popup.state.transaction = {
          id: transactionId!,
          status: 'pending',
        };
      });

      await when(() => !popup.isConnected || popup.state.status === 'done');
    }

    this.popupManagerStore.closePopup(instanceId);
  }
}
