import { ethers } from 'ethers';

export type PriceData = {
  amount: number;
  symbol: string;
  equalsTo?: Omit<PriceData, 'equalsTo'>;
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
  readonly provider: Provider | null;
};
