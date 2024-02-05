import { BigNumber } from 'ethers';
import { runInAction, when } from 'mobx';
import { ContractName, SendTransactionRequest, getTokenConfig, parseTransactionData } from '@cere-wallet/wallet-engine';

import { reportError } from '~/reporting';
import { Wallet } from '../types';
import { convertPrice } from './convertPrice';
import { PopupManagerStore } from '../PopupManagerStore';
import { NetworkStore } from '../NetworkStore';
import { AppContextStore } from '../AppContextStore';
import { TransactionPopupState } from '../TransactionPopupStore';

export type ApproveTransactionOptions = {
  showDetails?: boolean;
};

export class TransactionHandler {
  constructor(
    private wallet: Wallet,
    private popupManagerStore: PopupManagerStore,
    private networkStore: NetworkStore,
    private contextStore: AppContextStore,
  ) {}

  async handle(
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

    if (!showDetails) {
      return this.popupManagerStore.closePopup(instanceId);
    }

    when(
      () => !popup.isConnected || popup.state.status === 'done',
      () => {
        this.popupManagerStore.closePopup(instanceId);
      },
    );

    let isRejected = false;

    try {
      const { result: transactionId } = await proceed();

      runInAction(() => {
        popup.state.step = 'details';
        popup.state.transaction = {
          id: transactionId!,
          status: 'pending',
        };
      });

      const pendingTx = await this.wallet.provider!.getTransaction(transactionId!);
      await pendingTx.wait();
    } catch (error) {
      isRejected = true;

      reportError(error);
    }

    runInAction(() => {
      popup.state.transaction!.status = isRejected ? 'rejected' : 'confirmed';
    });
  }
}
