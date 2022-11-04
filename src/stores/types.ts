import { ChainConfig } from '@cere-wallet/wallet-engine';
import { ethers } from 'ethers';

export type PriceData = {
  amount: number;
  symbol: string;
  equalsTo?: Omit<PriceData, 'equalsTo'>;
};

export type Account = {
  address: string;
  privateKey: string;
  email: string;
  verifier: string;
  avatar?: string;
};

export type Asset = {
  ticker: string;
  displayName: string;
  network: string;
  balance?: number;
};

export type Nft = {
  nftId: string;
  minter: string;
  title: string;
  description: string;
  previewUrl?: string;
  collectionAddress?: string;
  collectionName?: string;
  network: string;
  quantity: number;
};

export type Provider = ethers.providers.JsonRpcProvider;

export type WalletStatus = 'idle' | 'ready' | 'unauthenticated' | 'errored';

export interface Wallet {
  readonly instanceId: string;
  readonly network?: ChainConfig;
  readonly provider?: Provider;
  readonly account?: Account;

  isRoot(): boolean;
  isReady(): this is ReadyWallet;
}

export type ReadyWallet = Required<Wallet>;
