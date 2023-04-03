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

      wallet_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = getAccounts();
      }),

      /**
       * Temp optimizations below
       * TODO: Implement lazy middleware concept and move the middleware below to the appropriate place
       */

      eth_chainId: createAsyncMiddleware(async (req, res) => {
        res.result = chainConfig.chainId;
      }),

      net_version: createAsyncMiddleware(async (req, res) => {
        res.result = chainConfig.chainId;
      }),

      eth_requestAccounts: createAsyncMiddleware(async (req, res) => {
        res.result = getAccounts()
          .filter((account) => account.type === 'ethereum')
          .map((account) => account.address);
      }),
    }),
  );

  return engine;
};
