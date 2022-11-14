import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';

import { ChainConfig } from '../types';

export type WalletMiddlewareOptions = {
  getAccounts: () => string[];
  chainConfig: ChainConfig;
};

export const createWalletMiddleware = ({ getAccounts = () => [], chainConfig }: WalletMiddlewareOptions) => {
  return createScaffoldMiddleware({
    wallet_getProviderState: createAsyncMiddleware(async (req, res) => {
      res.result = {
        accounts: getAccounts(),
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
