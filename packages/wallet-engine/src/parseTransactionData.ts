import { getContractAddress, Freeport__factory, TestERC20__factory, SimpleAuction__factory } from '@cere/freeport-sdk';
import { IncomingTransaction } from './middleware';

export enum ContractName {
  Freeport = 'Freeport',
  ERC20 = 'ERC20',
  SimpleAuction = 'SimpleAuction',
  Unknown = 'Unknown',
}

const contractInterfaceFactoryMap = {
  [ContractName.Freeport]: () => Freeport__factory.createInterface(),
  [ContractName.ERC20]: () => TestERC20__factory.createInterface(),
  [ContractName.SimpleAuction]: () => SimpleAuction__factory.createInterface(),
};

const getContractsAddressMap = (networkId: string) => {
  const chainId = parseInt(networkId, 16);
  const contractNames = Object.keys(contractInterfaceFactoryMap) as ContractName[];

  return contractNames.reduce((map, contractName) => {
    const address = getContractAddress({
      chainId,
      contractName,
      deployment: process.env.REACT_APP_ENV,
    });

    return {
      ...map,
      [address.toLocaleLowerCase()]: contractName,
    };
  }, {} as Record<string, ContractName>);
};

const getTrasactionContract = ({ to }: IncomingTransaction, networkId: string): ContractName => {
  const address = to.toLocaleLowerCase();
  const addressMap = getContractsAddressMap(networkId);

  return addressMap[address] || ContractName.Unknown;
};

export const parseTransactionData = (transaction: IncomingTransaction, chainId: string) => {
  const contractName = getTrasactionContract(transaction, chainId);

  if (contractName === ContractName.Unknown) {
    return { contractName };
  }

  const contractInterface = contractInterfaceFactoryMap[contractName]();
  const description = contractInterface.parseTransaction({ data: transaction.data });

  return {
    contractName,
    description,
  };
};
