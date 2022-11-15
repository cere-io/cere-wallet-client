import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';

import { ChainConfig, Account } from '../types';

export type WalletMiddlewareOptions = {
  getAccounts: () => Account[];
  chainConfig: ChainConfig;
};

export const createWalletMiddleware = ({ getAccounts = () => [], chainConfig }: WalletMiddlewareOptions) => {
  return createScaffoldMiddleware({
    wallet_getProviderState: createAsyncMiddleware(async (req, res) => {
      res.result = {
        accounts: getAccounts().map((account) => account.address),
        chainId: chainConfig.chainId,
        isUnlocked: true,
        networkVersion: chainConfig.chainId,
      };
    }),

    wallet_sendDomainMetadata: createAsyncMiddleware(async (req, res) => {
      res.result = true;
    }),
  });
};
