import { ContractInterface } from 'ethers';
import { getContractAddress, Freeport__factory, TestERC20__factory } from '@cere/freeport-sdk';
import { IncomingTransaction } from './middleware';

const contractInterfaceFactoryMap = {
  Freeport: () => Freeport__factory.createInterface(),
  ERC20: () => TestERC20__factory.createInterface(),
} as const;

export type ContractName = keyof typeof contractInterfaceFactoryMap | 'Unknown';

const getContractsAddressMap = (networkId: string) => {
  const contractNames: ContractName[] = ['Freeport', 'ERC20'];
  const chainId = parseInt(networkId, 16);

  return contractNames.reduce((map, contractName) => {
    const address = getContractAddress({
      chainId,
      contractName,
      deployment: 'dev',
    });

    return {
      ...map,
      [address.toLocaleLowerCase()]: contractName,
    };
  }, {} as Record<string, ContractName>);
};

const getTrasactionContract = ({ to }: IncomingTransaction, networkId: string) => {
  const address = to.toLocaleLowerCase();
  const addressMap = getContractsAddressMap(networkId);

  return addressMap[address] || 'Unknown';
};

export const parseTransactionData = (transaction: IncomingTransaction, chainId: string) => {
  const contractName = getTrasactionContract(transaction, chainId);

  if (contractName === 'Unknown') {
    return { contractName };
  }

  const contractInterface: ContractInterface = contractInterfaceFactoryMap[contractName]();
  const description = contractInterface.parseTransaction({ data: transaction.data });

  return {
    contractName,
    description,
  };
};
