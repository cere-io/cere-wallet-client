import { createAsyncMiddleware, createScaffoldMiddleware } from 'json-rpc-engine';
import { ed25519Sign } from '@polkadot/util-crypto';

import { Engine } from './engine';
import { Account } from '../types';
import { getKeyPair } from '../accounts';

export type PolkadotEngineOptions = {
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
};

export const createPolkadotEngine = ({ getPrivateKey, getAccounts }: PolkadotEngineOptions) => {
  const engine = new Engine();
  const getEd25519Accounts = () => getAccounts().filter((account) => account.type === 'ed25519');

  engine.push(
    createScaffoldMiddleware({
      wallet_updateAccounts: createAsyncMiddleware(async (req, res, next) => {
        engine.emit('message', {
          type: 'ed25519_accountsChanged',
          data: getEd25519Accounts(),
        });

        next();
      }),

      ed25519_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = getEd25519Accounts();
      }),

      ed25519_sign: createAsyncMiddleware(async (req, res) => {
        const privateKey = getPrivateKey();
        const [, message] = req.params as string[];

        if (!privateKey) {
          throw new Error('No private key was provided!');
        }

        const signature = ed25519Sign(message, getKeyPair({ type: 'ed25519', privateKey }));
        res.result = '0x' + Buffer.from(signature).toString('hex');
      }),
    }),
  );

  return engine;
};
