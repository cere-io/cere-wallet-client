import { makeAutoObservable, when } from 'mobx';
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

const convertPrice = (amount: BigNumber, { decimals }: TokenConfig) => {
  return amount.div(10 ** decimals).toNumber();
};

export class ApprovalStore {
  constructor(
    private wallet: Wallet,
    private popupManagerStore: PopupManagerStore,
    private networkStore: NetworkStore,
  ) {
    makeAutoObservable(this);
  }

  async approvePersonalSign({ preopenInstanceId, params: [content] }: PersonalSignRequest) {
    const tokenConfig = getTokenConfig();
    const popup = await this.popupManagerStore.proceedTo<ConfirmPopupState>(preopenInstanceId, '/confirm', {
      network: this.networkStore.network,
      status: 'pending',
      content,
      fee: { amount: 0, symbol: tokenConfig.symbol }, // TODO: Detect gas fee
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(preopenInstanceId);

    if (!popup.isConnected) {
      throw new Error('User has closed the confirmation popup');
    }

    if (popup.state.status === 'declined') {
      throw new Error('User has declined the signing request');
    }
  }

  async approveSendTransaction({ preopenInstanceId, params: [transaction] }: SendTransactionRequest) {
    const tokenConfig = getTokenConfig();
    const network = this.networkStore.network!;
    const { contractName, description: parsedData } = parseTransactionData(transaction, network.chainId);

    const popup = await this.popupManagerStore.proceedTo<TransactionPopupState>(preopenInstanceId, '/transaction', {
      network,
      status: 'pending',
      from: transaction.from,
      to: transaction.to,
      rawData: transaction.data,
      parsedData,
      action: parsedData?.name,
    });

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

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(preopenInstanceId);

    if (!popup.isConnected) {
      throw new Error('User has closed the confirmation popup');
    }

    if (popup.state.status === 'declined') {
      throw new Error('User has declined the transaction request');
    }
  }
}
