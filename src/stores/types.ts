import { ChainConfig, Account } from '@cere-wallet/wallet-engine';
import { ethers } from 'ethers';
import { ReactElement } from 'react';

export type PriceData = {
  amount: number;
  symbol: string;
  equalsTo?: Omit<PriceData, 'equalsTo'>;
};

export type User = {
  email: string;
  name: string;
  avatar?: string;
};

export type Asset = {
  ticker: string;
  displayName: string;
  network: string;
  balance?: number;
};

export type AssetRefillProvider = {
  name: string;
  logo: ReactElement;
  smallLogo: ReactElement;
  payMethodList: string[];
  fees: string;
  limits: string;
  assetList: string[];
};

export type Nft = {
  nftId: string;
  minter: string;
  title: string;
  description?: string;
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
  readonly accounts: Account[];

  isRoot(): boolean;
  isReady(): this is ReadyWallet;
}

export type ReadyWallet = Required<Wallet>;
