import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';

import { Engine } from './engine';
import { ChainConfig, Account } from '../types';

export type WalletEngineOptions = {
  getAccounts: () => Account[];
  chainConfig: ChainConfig;
};

export const createWalletEngine = ({ getAccounts = () => [], chainConfig }: WalletEngineOptions) => {
  const engine = new Engine();

  engine.push(
    createScaffoldMiddleware({
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
    }),
  );

  return engine;
};
