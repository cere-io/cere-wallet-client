import { Signer } from 'ethers';
import {
  getContractAddress as getSCAddress,
  Freeport__factory,
  TestERC20__factory,
  SimpleAuction__factory,
  createERC20,
  getTokenConfig as fpGetTokenConfig,
} from '@cere/freeport-sdk';

export type { TokenConfig } from '@cere/freeport-sdk';

export enum ContractName {
  Freeport = 'Freeport',
  ERC20 = 'ERC20',
  SimpleAuction = 'SimpleAuction',
}

const contractInterfaceFactoryMap = {
  [ContractName.Freeport]: () => Freeport__factory.createInterface(),
  [ContractName.ERC20]: () => TestERC20__factory.createInterface(),
  [ContractName.SimpleAuction]: () => SimpleAuction__factory.createInterface(),
};

export const getContractInterface = (contractName: ContractName) => {
  return contractInterfaceFactoryMap[contractName]();
};

export const getContractAddress = (contractName: ContractName, networkId: string) =>
  getSCAddress({
    contractName,
    chainId: parseInt(networkId, 16),
    deployment: process.env.REACT_APP_ENV,
  });

export const createERC20Contract = (signer: Signer, networkId: string) =>
  createERC20({
    signer,
    contractAddress: getContractAddress(ContractName.ERC20, networkId),
  });

export const getTokenConfig = () => fpGetTokenConfig(process.env.REACT_APP_ENV);
