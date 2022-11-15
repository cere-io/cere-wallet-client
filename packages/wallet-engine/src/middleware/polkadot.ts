import { createAsyncMiddleware, createScaffoldMiddleware } from 'json-rpc-engine';
import { ed25519Sign } from '@polkadot/util-crypto';

import { Account } from '../types';
import { getKeyPair } from '../accounts';

export type PolkadotMiddlewareOptions = {
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
};

export const createPolkadotMiddleware = ({ getPrivateKey, getAccounts }: PolkadotMiddlewareOptions) => {
  return createScaffoldMiddleware({
    ed25519_accounts: createAsyncMiddleware(async (req, res) => {
      res.result = getAccounts().filter((account) => account.type === 'ed25519');
    }),

    ed25519_sign: createAsyncMiddleware(async (req, res) => {
      const privateKey = getPrivateKey();
      const [, message] = req.params as string[];

      if (!privateKey) {
        throw new Error('No private key was provided!');
      }

      const signature = ed25519Sign(message, getKeyPair({ type: 'ed25519', privateKey }));
      res.result = Buffer.from(signature).toString('hex');
    }),
  });
};
