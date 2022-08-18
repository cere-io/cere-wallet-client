import { ethers } from 'ethers';

export type Provider = ethers.providers.JsonRpcProvider;

export type PriceData = {
  amount: number;
  symbol: string;
  equalsTo?: Omit<PriceData, 'equalsTo'>;
};
