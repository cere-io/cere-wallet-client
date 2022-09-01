import { Signer } from 'ethers';
import {
  ApplicationEnum,
  getContractAddress as getSCAddress,
  createERC20,
  getTokenConfig as fpGetTokenConfig,
  Freeport__factory,
  TestERC20__factory,
  SimpleAuction__factory,
  Auction__factory,
  CollectionFactory__factory,
  Marketplace__factory,
} from '@cere/freeport-sdk';

export type { TokenConfig } from '@cere/freeport-sdk';

export enum ContractName {
  Freeport = 'Freeport',
  ERC20 = 'ERC20',
  SimpleAuction = 'SimpleAuction',
  Auction = 'Auction',
  Marketplace = 'Marketplace',
  CollectionFactory = 'CollectionFactory',
}

const applications = [ApplicationEnum.DAVINCI, ApplicationEnum.LIVEONE];
const contractInterfaceFactoryMap = {
  [ContractName.Freeport]: () => Freeport__factory.createInterface(),
  [ContractName.ERC20]: () => TestERC20__factory.createInterface(),
  [ContractName.SimpleAuction]: () => SimpleAuction__factory.createInterface(),
  [ContractName.Auction]: () => Auction__factory.createInterface(),
  [ContractName.Marketplace]: () => Marketplace__factory.createInterface(),
  [ContractName.CollectionFactory]: () => CollectionFactory__factory.createInterface(),
};

export const getContractInterface = (contractName: ContractName) => {
  return contractInterfaceFactoryMap[contractName]();
};

export const getContractAddress = (
  contractName: ContractName,
  networkId: string,
  application: ApplicationEnum = ApplicationEnum.DAVINCI,
) =>
  getSCAddress({
    application,
    contractName,
    chainId: parseInt(networkId, 16),
    deployment: process.env.REACT_APP_ENV,
  });

const getAllContractAdresses = (contractName: ContractName, networkId: string) => {
  const addresses = applications.map((app) => {
    try {
      return getContractAddress(contractName, networkId, app);
    } catch {
      return undefined;
    }
  });

  return addresses.filter(Boolean).map((address) => address!.toLocaleLowerCase());
};

export const getContractNameByAddress = (address: string, networkId: string) => {
  const contractNames = Object.keys(ContractName) as ContractName[];
  const loweredAddress = address.toLocaleLowerCase();

  return contractNames.find((name) => getAllContractAdresses(name, networkId).includes(loweredAddress));
};

export const createERC20Contract = (signer: Signer, networkId: string, application?: ApplicationEnum) =>
  createERC20({
    signer,
    contractAddress: getContractAddress(ContractName.ERC20, networkId, application),
  });

export const getTokenConfig = () => fpGetTokenConfig(process.env.REACT_APP_ENV);
