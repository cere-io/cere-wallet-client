import { makeAutoObservable, when } from 'mobx';
import { PersonalSignRequest, SendTransactionRequest, Provider, IncomingTransaction } from '@cere-wallet/wallet-engine';
import {
  getContractAddress,
  getTokenConfig,
  Freeport__factory,
  TestERC20__factory,
  TokenConfig,
} from '@cere/freeport-sdk';

import { PopupManagerStore } from '../PopupManagerStore';
import { NetworkStore } from '../NetworkStore';
import { TransactionPopupState } from '../TransactionPopupStore';
import { ConfirmPopupState } from '../ConfirmPopupStore';
import { BigNumber, ethers } from 'ethers';

type ContractName = 'Freeport' | 'ERC20';
const isContractTransaction = (networkId: string, contractName: ContractName, { to }: IncomingTransaction) => {
  const address = to.toLocaleLowerCase();
  const chainId = parseInt(networkId, 16);
  const contractAddress = getContractAddress({
    chainId,
    contractName,
    deployment: 'dev',
  });

  return address === contractAddress.toLocaleLowerCase();
};

const getContractInterface = (contractName: ContractName): ethers.utils.Interface => {
  if (contractName === 'ERC20') {
    return TestERC20__factory.createInterface();
  }

  if (contractName === 'Freeport') {
    return Freeport__factory.createInterface();
  }

  throw new Error('Unknown smart contract name');
};

const convertPrice = (amount: BigNumber, { decimals }: TokenConfig) => {
  return amount.div(10 ** decimals).toNumber();
};

export class ApprovalStore {
  provider?: Provider;

  constructor(private popupManagerStore: PopupManagerStore, private networkStore: NetworkStore) {
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
    const popup = await this.popupManagerStore.proceedTo<TransactionPopupState>(preopenInstanceId, '/transaction', {
      network,
      status: 'pending',
      from: transaction.from,
      to: transaction.to,
      rawData: transaction.data,
    });

    if (isContractTransaction(network.chainId, 'ERC20', transaction)) {
      const result = getContractInterface('ERC20').parseTransaction({ data: transaction.data });

      if (result.name === 'approve') {
        popup.state.toConfirm = {
          symbol: tokenConfig.symbol,
          amount: convertPrice(result.args.amount, tokenConfig),
        };
      }

      popup.state.parsedData = result;
    }

    if (isContractTransaction(network.chainId, 'Freeport', transaction)) {
      const result = getContractInterface('Freeport').parseTransaction({ data: transaction.data });

      if (result.name === 'takeOffer') {
        const price = convertPrice(result.args.expectedPriceOrZero, tokenConfig);
        const amount = (result.args.amount as BigNumber).toNumber();
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

      popup.state.parsedData = result;
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
