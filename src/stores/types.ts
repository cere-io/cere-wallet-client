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
  avatar?: string;
};

export type Asset = {
  ticker: string;
  displayName: string;
  network: string;
  balance?: number;
};

export type Provider = ethers.providers.JsonRpcProvider;
export type Wallet = {
  readonly instanceId: string;
  readonly network?: ChainConfig;
  readonly provider?: Provider;
  readonly account?: Account;
};
