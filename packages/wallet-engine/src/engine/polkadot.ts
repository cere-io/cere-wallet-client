import { createAsyncMiddleware, createScaffoldMiddleware } from 'json-rpc-engine';
import { u8aToHex } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';

import { Engine } from './engine';
import { Account } from '../types';
import { getKeyPair } from '../accounts';

export type PolkadotEngineOptions = {
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
};

const getPair = (address: string, privateKey?: string) => {
  if (!privateKey) {
    throw new Error('No private key was provided!');
  }

  const { publicKey, secretKey } = getKeyPair({ type: 'ed25519', privateKey });
  const keyring = new Keyring({ type: 'ed25519' });

  keyring.addFromPair({ publicKey, secretKey });

  return keyring.getPair(address);
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
        const [address, message] = req.params as string[];
        const signature = getPair(address, privateKey).sign(message, { withType: true });

        res.result = u8aToHex(signature);
      }),
    }),
  );

  return engine;
};
