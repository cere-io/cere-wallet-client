import type { Signer } from 'ethers';
import {
  ApplicationEnum,
  Deployment,
  ChainId,
  getContractAddress as getSCAddress,
  createERC20MockToken,
  Freeport__factory,
  ERC20MockToken__factory,
  Marketplace__factory,
  FreeportCollection__factory,
  FiatGateway__factory,
  FToken__factory,
  ERC20MockToken,
} from '@cere/freeport-sc-sdk';

import { CERE_TOKEN_ADDRESS } from './constants';

export type TokenConfig = {
  symbol: string;
  decimals: number;
};

export type ERC20Contract = ERC20MockToken;
export enum ContractName {
  Freeport = 'Freeport',
  FToken = 'FToken',
  Marketplace = 'Marketplace',
  FreeportCollection = 'FreeportCollection',
  FiatGateway = 'FiatGateway',
  ERC20Token = 'ERC20MockToken',
  CereToken = 'CereToken',
}

const applications = [ApplicationEnum.DAVINCI, ApplicationEnum.LIVEONE];
const contractInterfaceFactoryMap = {
  [ContractName.Freeport]: () => Freeport__factory.createInterface(),
  [ContractName.ERC20Token]: () => ERC20MockToken__factory.createInterface(),
  [ContractName.Marketplace]: () => Marketplace__factory.createInterface(),
  [ContractName.FreeportCollection]: () => FreeportCollection__factory.createInterface(),
  [ContractName.CereToken]: () => ERC20MockToken__factory.createInterface(),
  [ContractName.FiatGateway]: () => FiatGateway__factory.createInterface(),
  [ContractName.FToken]: () => FToken__factory.createInterface(),
};

export const getContractInterface = (contractName: ContractName) => {
  return contractInterfaceFactoryMap[contractName]();
};

export const getContractAddress = (
  contractName: ContractName,
  networkId: string,
  application: ApplicationEnum = ApplicationEnum.DAVINCI,
) => {
  if (contractName === ContractName.CereToken) {
    return CERE_TOKEN_ADDRESS;
  }

  return getSCAddress({
    application,
    contractName,
    chainId: parseInt(networkId, 16) as ChainId,
    deployment: process.env.REACT_APP_ENV as Deployment,
  });
};

const getAllContractAddresses = (contractName: ContractName, networkId: string) => {
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

  return contractNames.find((name) => getAllContractAddresses(name, networkId).includes(loweredAddress));
};

export const createERC20Contract = (signer: Signer, address: string) =>
  createERC20MockToken({
    signer,
    contractAddress: address,
  });

/**
 * TODO: Remove when decimals are fetched from the contract everywhere
 *
 * @deprecated `decimals` should be fetched from the contract
 */
export const getERC20TokenConfig = (): TokenConfig => ({
  symbol: 'USDC',
  decimals: process.env.REACT_APP_ENV === 'dev' ? 18 : 6,
});
