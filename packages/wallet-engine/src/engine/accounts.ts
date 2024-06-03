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
        const accounts = privateKey ? getKeyPairs(privateKey, ['ethereum', 'ed25519', 'solana']) : [];
        const [eth, ed255519, solana] = accounts;

        onUpdateAccounts(accounts);

        /**
         * Custom wallet messages
         */
        engine.emit('message', { type: 'wallet_accountsChanged', data: accounts });
        engine.emit('message', { type: 'eth_accountChanged', data: eth });
        engine.emit('message', { type: 'ed25519_accountChanged', data: ed255519 });
        engine.emit('message', { type: 'solana_accountChanged', data: solana });

        /**
         * Standard eip-1193 event
         */
        engine.emit('accountsChanged', eth ? [eth.address] : []);

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
