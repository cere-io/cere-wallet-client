import { IncomingTransaction } from './middleware';

import { ContractName, getContractAddress, getContractInterface } from './contracts';

const getContractsAddressMap = (networkId: string) => {
  const contractNames = Object.keys(ContractName) as ContractName[];

  return contractNames.reduce(
    (map, contractName) => ({
      ...map,
      [getContractAddress(contractName, networkId).toLocaleLowerCase()]: contractName,
    }),
    {} as Record<string, ContractName>,
  );
};

const getTrasactionContract = ({ to }: IncomingTransaction, networkId: string): ContractName | undefined => {
  const address = to.toLocaleLowerCase();
  const addressMap = getContractsAddressMap(networkId);

  return addressMap[address];
};

export const parseTransactionData = (transaction: IncomingTransaction, chainId: string) => {
  const contractName = getTrasactionContract(transaction, chainId);

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
