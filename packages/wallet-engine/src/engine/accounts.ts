import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';

import { Engine } from './engine';
import { getKeyPairs } from '../accounts';
import { Account, KeyPair, KeyType } from '../types';

export type AccountsEngineOptions = {
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
  onUpdateAccounts: (accounts: KeyPair[]) => void;
};

export const createAccountsEngine = ({ getPrivateKey, getAccounts, onUpdateAccounts }: AccountsEngineOptions) => {
  const engine = new Engine();

  const getAddresses = (type: KeyType) =>
    getAccounts()
      .filter((account) => account.type === type)
      .map((account) => account.address);

  engine.push(
    createScaffoldMiddleware({
      wallet_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = getAccounts();
      }),

      ed25519_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = getAddresses('ed25519');
      }),

      eth_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = getAddresses('ethereum');
      }),

      solana_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = getAddresses('solana');
      }),

      eth_requestAccounts: createAsyncMiddleware(async (req, res) => {
        res.result = getAddresses('ethereum');
      }),

      wallet_updateAccounts: createAsyncMiddleware(async (req, res) => {
        const privateKey = getPrivateKey();
        const keyPairs = privateKey ? getKeyPairs(privateKey, ['ethereum', 'ed25519', 'solana']) : [];

        onUpdateAccounts(keyPairs);

        const accounts = getAccounts();
        const ethAccounts = accounts.filter((account) => account.type === 'ethereum');
        const ed25519Accounts = accounts.filter((account) => account.type === 'ed25519');
        const solanaAccounts = accounts.filter((account) => account.type === 'solana');

        /**
         * Custom wallet messages
         */
        engine.emit('message', { type: 'wallet_accountsChanged', data: accounts });
        engine.emit('message', { type: 'eth_accountsChanged', data: ethAccounts });
        engine.emit('message', { type: 'ed25519_accountsChanged', data: ed25519Accounts });
        engine.emit('message', { type: 'solana_accountsChanged', data: solanaAccounts });

        /**
         * Standard eip-1193 event
         */
        engine.emit(
          'accountsChanged',
          ethAccounts.map((account) => account.address),
        );

        res.result = accounts;
      }),

      wallet_getProviderState: createAsyncMiddleware(async (req, res, next) => {
        res.result = {
          ...(res.result as {}),
          accounts: getAddresses('ethereum'),
        };
      }),
    }),
  );

  return engine;
};
