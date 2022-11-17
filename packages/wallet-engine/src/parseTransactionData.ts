import { IncomingTransaction } from './engine';

import { getContractInterface, getContractNameByAddress } from './contracts';

export const parseTransactionData = (transaction: IncomingTransaction, chainId: string) => {
  const contractName = getContractNameByAddress(transaction.to, chainId);

  if (!contractName) {
    return {
      contractName: undefined,
      description: undefined,
    };
  }

  const contractInterface = getContractInterface(contractName);
  const description = contractInterface.parseTransaction({ data: transaction.data });

  return {
    contractName,
    description,
  };
};
