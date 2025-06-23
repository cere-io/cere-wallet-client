import type { Signer } from 'ethers';
import { ethers } from 'ethers';

// Mock implementation for missing @cere/freeport-sc-sdk
export enum ApplicationEnum {
  DAVINCI = 'davinci',
  LIVEONE = 'liveone',
}

export enum Deployment {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
}

export enum ChainId {
  MAINNET = 1,
  TESTNET = 5,
  DEVNET = 1337,
}

// Mock contract factories
export class Freeport__factory {
  static createInterface() {
    return new ethers.utils.Interface([]);
  }
}

export class ERC20MockToken__factory {
  static createInterface() {
    return new ethers.utils.Interface([]);
  }
}

export class Marketplace__factory {
  static createInterface() {
    return new ethers.utils.Interface([]);
  }
}

export class FreeportCollection__factory {
  static createInterface() {
    return new ethers.utils.Interface([]);
  }
}

export class FiatGateway__factory {
  static createInterface() {
    return new ethers.utils.Interface([]);
  }
}

export class FToken__factory {
  static createInterface() {
    return new ethers.utils.Interface([]);
  }
}

// Mock ERC20 token class
export class ERC20MockToken {
  private signer: Signer;
  private address: string;

  constructor(signer: Signer, address: string) {
    this.signer = signer;
    this.address = address;
  }
  
  async decimals(): Promise<number> {
    return 6; // Default to 6 decimals for USDC
  }

  async balanceOf(address: string): Promise<ethers.BigNumber> {
    // Return a proper BigNumber with 0 value
    return ethers.BigNumber.from('0');
  }

  async transfer(to: string, amount: any, options?: any): Promise<any> {
    // Mock transfer - return a mock transaction hash
    return { hash: '0x0000000000000000000000000000000000000000000000000000000000000000' };
  }

  async name(): Promise<string> {
    return 'Mock Token';
  }

  async symbol(): Promise<string> {
    return 'MTK';
  }

  // Mock filters property
  get filters() {
    return {
      Transfer: (from: string | null, to?: string) => ({
        from,
        to,
        address: this.address,
      }),
    };
  }

  // Mock interface property
  get interface() {
    return {
      parseLog: (log: any) => ({
        name: 'Transfer',
        args: {
          from: '0x0000000000000000000000000000000000000000',
          to: '0x0000000000000000000000000000000000000000',
          value: '0',
        },
      }),
      // Add other required Interface properties
      fragments: [],
      errors: {},
      events: {},
      functions: {},
      deploy: {},
      callState: {},
      _abiCoder: {},
      _isInterface: true,
      format: () => '',
      parseError: () => ({}),
      parseTransaction: () => ({}),
      encodeFunctionData: () => '',
      encodeFunctionResult: () => '',
      encodeEventLog: () => ({}),
      encodeFilterTopics: () => [],
      encodeDeploy: () => ({}),
      getFunction: () => ({}),
      getEvent: () => ({}),
      getError: () => ({}),
      hasFunction: () => false,
      hasEvent: () => false,
      hasError: () => false,
    } as any; // Use 'any' to bypass strict type checking
  }
}

// Mock functions
export const getSCAddress = (params: {
  application: ApplicationEnum;
  contractName: string;
  chainId: ChainId;
  deployment: Deployment;
}): string => {
  // Return a mock address
  return '0x0000000000000000000000000000000000000000';
};

export const createERC20MockToken = (params: {
  signer: Signer;
  contractAddress: string;
}): ERC20MockToken => {
  return new ERC20MockToken(params.signer, params.contractAddress);
};

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

export const getERC20TokenConfig = async (signer: Signer): Promise<TokenConfig> => {
  const chainId = await signer.getChainId();
  const address = getContractAddress(ContractName.ERC20Token, chainId.toString(16));
  const contract = createERC20Contract(signer, address);
  const decimals = await contract.decimals();

  return {
    symbol: 'USDC', // Keep it hardcoded for better UX
    decimals,
  };
};
