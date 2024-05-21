import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';

import { Engine } from './engine';
import { getKeyPair } from '../accounts';
import { Account, KeyPair, KeyType } from '../types';

export type AccountsEngineOptions = {
  getAccounts: (pairs: KeyPair[]) => Account[];
  getPrivateKey: () => string | undefined;
  onUpdateAccounts: (accounts: Account[]) => void;
};

export const createAccountsEngine = ({ getPrivateKey, getAccounts, onUpdateAccounts }: AccountsEngineOptions) => {
  const engine = new Engine();

  const createAccounts = (types: KeyType[]) => {
    const privateKey = getPrivateKey();

    return !privateKey ? [] : getAccounts(types.map((type) => getKeyPair({ type, privateKey })));
  };

  engine.push(
    createScaffoldMiddleware({
      wallet_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = createAccounts(['ethereum', 'ed25519', 'solana']);
      }),

      ed25519_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = createAccounts(['ed25519']);
      }),

      eth_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = createAccounts(['ethereum']).map((account) => account.address);
      }),

      solana_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = createAccounts(['solana']).map((account) => account.address);
      }),

      eth_requestAccounts: createAsyncMiddleware(async (req, res) => {
        res.result = createAccounts(['ethereum']).map((account) => account.address);
      }),

      wallet_updateAccounts: createAsyncMiddleware(async (req, res) => {
        const accounts = createAccounts(['ethereum', 'ed25519', 'solana']);
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
          accounts: createAccounts(['ethereum']).map((account) => account.address),
        };
      }),
    }),
  );

  return engine;
};
