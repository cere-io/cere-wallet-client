// Stub types for @cere/freeport-sc-sdk@0.26.0 (unpublished from npm).
// Permissive shapes so the wallet builds; runtime calls into legacy Freeport
// contracts throw with a clear error.
import type { Contract, ContractInterface, Signer, BigNumber, providers } from 'ethers';

export enum ApplicationEnum {
  DAVINCI = 'DAVINCI',
  LIVEONE = 'LIVEONE',
}

export type Deployment = string;
export type ChainId = number;

export type GetContractAddressArgs = {
  application: ApplicationEnum;
  contractName: string;
  chainId: ChainId;
  deployment: Deployment;
};
export function getContractAddress(args: GetContractAddressArgs): string;

export interface ERC20MockToken extends Contract {
  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<number>;
  balanceOf(address: string): Promise<BigNumber>;
  transfer(to: string, amount: BigNumber | string, overrides?: any): Promise<{ hash: string; wait(): Promise<any> }>;
  approve(spender: string, amount: BigNumber | string, overrides?: any): Promise<{ hash: string; wait(): Promise<any> }>;
}

export type CreateERC20MockTokenArgs = {
  signer: Signer | providers.Provider;
  contractAddress: string;
};
export function createERC20MockToken(args: CreateERC20MockTokenArgs): ERC20MockToken;

export interface StubFactory {
  createInterface(): ContractInterface & {
    parseTransaction(tx: { data: string; value?: any }): { name: string; args: any; signature: string; sighash: string; value: any; functionFragment: any };
  };
  connect(address: string, signerOrProvider: Signer | providers.Provider): Contract;
}
export const Freeport__factory: StubFactory;
export const ERC20MockToken__factory: StubFactory;
export const Marketplace__factory: StubFactory;
export const FreeportCollection__factory: StubFactory;
export const FiatGateway__factory: StubFactory;
export const FToken__factory: StubFactory;
