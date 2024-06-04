import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';

import { Engine } from './engine';
import { Account, ChainConfig } from '../types';

export type WalletEngineOptions = {
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
  chainConfig: ChainConfig;
};

export const createWalletEngine = ({ chainConfig, getAccounts, getPrivateKey }: WalletEngineOptions) => {
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

      /**
       * Routes the universal sign message method to the correct provider
       */
      wallet_signMessage: createAsyncMiddleware(async (req, res, next) => {
        const [address, message] = req.params as [string, string];

        /**
         * TODO: Think about a better approach to compare addresses.
         * Addresses for some chains are case-sensitive, so we need think about a beeter way of comparing it.
         * For now, we just convert both to uppercase to make it work. But this is not a perfect solution.
         * We can keep it for now since there is a very low probability of two addresses that are the same but with different cases.
         */
        const account = getAccounts().find((account) => account.address.toUpperCase() === address.toUpperCase());

        if (!account) {
          throw new Error(`Account with address ${address} not found!`);
        }

        if (account.type === 'ethereum') {
          req.method = 'personal_sign';
          req.params = [message, address];
        }

        if (account.type === 'ed25519') {
          req.method = 'ed25519_signRaw';
        }

        if (account.type === 'solana') {
          req.method = 'solana_signMessage';
        }

        next();
      }),
    }),
  );

  return engine;
};
