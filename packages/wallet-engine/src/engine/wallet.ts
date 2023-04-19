import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';

import { Engine } from './engine';
import { ChainConfig } from '../types';

export type WalletEngineOptions = {
  getPrivateKey: () => string | undefined;
  chainConfig: ChainConfig;
};

export const createWalletEngine = ({ chainConfig, getPrivateKey }: WalletEngineOptions) => {
  const engine = new Engine();

  engine.push(
    createScaffoldMiddleware({
      wallet_sendDomainMetadata: createAsyncMiddleware(async (req, res) => {
        res.result = true;
      }),

      eth_chainId: createAsyncMiddleware(async (req, res) => {
        res.result = chainConfig.chainId;
      }),

      net_version: createAsyncMiddleware(async (req, res) => {
        res.result = chainConfig.chainId;
      }),

      wallet_accounts: createAsyncMiddleware(async (req, res, next) => {
        res.result = [];

        return getPrivateKey() ? next() : undefined;
      }),

      wallet_updateAccounts: createAsyncMiddleware(async (req, res, next) => {
        res.result = [];

        return getPrivateKey() ? next() : undefined;
      }),

      wallet_getProviderState: createAsyncMiddleware(async (req, res, next) => {
        res.result = {
          accounts: [],
          chainId: chainConfig.chainId,
          isUnlocked: true,
          networkVersion: chainConfig.chainId,
        };

        return getPrivateKey() ? next() : undefined;
      }),

      eth_requestAccounts: createAsyncMiddleware(async (req, res, next) => {
        res.result = [];

        return getPrivateKey() ? next() : undefined;
      }),
    }),
  );

  return engine;
};
