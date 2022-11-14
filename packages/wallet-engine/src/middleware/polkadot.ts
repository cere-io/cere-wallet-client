import { createAsyncMiddleware, createScaffoldMiddleware } from 'json-rpc-engine';

import { getAccount, getKeyPair } from '../accounts';
import { ed25519Sign } from '@polkadot/util-crypto';

export type PolkadotMiddlewareOptions = {
  getPrivateKey: () => string | undefined;
};

export const createPolkadotMiddleware = ({ getPrivateKey }: PolkadotMiddlewareOptions) => {
  return createScaffoldMiddleware({
    ed25519_accounts: createAsyncMiddleware(async (req, res) => {
      const privateKey = getPrivateKey();

      res.result = privateKey ? [getAccount(privateKey, 'ed25519').address] : [];
    }),

    ed25519_sign: createAsyncMiddleware(async (req, res) => {
      const privateKey = getPrivateKey();
      const [, message] = req.params as string[];

      if (!privateKey) {
        throw new Error('No private key was provided!');
      }

      const signature = ed25519Sign(message, getKeyPair(privateKey, 'ed25519'));
      res.result = Buffer.from(signature).toString('hex');
    }),
  });
};
