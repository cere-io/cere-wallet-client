import { createAsyncMiddleware, createScaffoldMiddleware } from 'json-rpc-engine';
import { u8aToHex } from '@polkadot/util';
import { Keyring } from '@polkadot/keyring';

import { Engine } from './engine';
import { Account } from '../types';
import { getKeyPair } from '../accounts';
import { SignerPayloadJSON } from '@polkadot/types/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';

export type PolkadotEngineOptions = {
  polkadotRpc: string;
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
};

const createPair = (address: string, privateKey?: string) => {
  if (!privateKey) {
    throw new Error('No private key was provided!');
  }

  const { publicKey, secretKey } = getKeyPair({ type: 'ed25519', privateKey });
  const keyring = new Keyring({ type: 'ed25519' });

  keyring.addFromPair({ publicKey, secretKey });

  return keyring.getPair(address);
};

const createApi = (rpcUrl: string) => {
  const provider = new WsProvider(rpcUrl);

  return new ApiPromise({ provider });
};

export const createPolkadotEngine = ({ getPrivateKey, getAccounts, polkadotRpc }: PolkadotEngineOptions) => {
  const engine = new Engine();
  const api = createApi(polkadotRpc);

  const getEd25519Accounts = () => getAccounts().filter((account) => account.type === 'ed25519');
  const getPair = (address: string) => {
    const privateKey = getPrivateKey();

    return createPair(address, privateKey);
  };

  const startBalanceListener = async (address: string) => {
    await api.isReady;

    return api.query.system.account(address, ({ data }: AccountInfo) => {
      const balance = data.free.toString();

      engine.emit('message', {
        type: 'ed25519_balanceChanged',
        data: { balance },
      });
    });
  };

  engine.push(
    createScaffoldMiddleware({
      wallet_updateAccounts: createAsyncMiddleware(async (req, res, next) => {
        const [account] = getEd25519Accounts();

        engine.emit('message', {
          type: 'ed25519_accountChanged',
          data: account,
        });

        if (account) {
          startBalanceListener(account.address);
        }

        next();
      }),

      ed25519_accounts: createAsyncMiddleware(async (req, res) => {
        res.result = getEd25519Accounts();
      }),

      ed25519_sign: createAsyncMiddleware(async (req, res) => {
        await api.isReady;

        const [address, message] = req.params as string[];
        const pair = getPair(address);
        const signature = pair.sign(message, { withType: true });

        res.result = u8aToHex(signature);
      }),

      ed25519_signPayload: createAsyncMiddleware(async (req, res) => {
        await api.isReady;

        const [payload] = req.params as [SignerPayloadJSON];
        const pair = getPair(payload.address);

        const extrinsic = api.registry.createType('ExtrinsicPayload', payload, { version: payload.version });
        const { signature } = extrinsic.sign(pair);

        res.result = signature;
      }),

      ed25519_getBalance: createAsyncMiddleware(async (req, res) => {
        await api.isReady;

        const [address] = req.params as [string];
        const coded = await api.query.system.account(address);
        const { data } = coded as AccountInfo;

        res.result = data.free.toString();
      }),

      ed25519_transfer: createAsyncMiddleware(async (req, res) => {
        await api.isReady;

        const [from, to, value] = req.params as [string, string, string];
        const pair = getPair(from);

        const hash = await api.tx.balances.transfer(to, value).signAndSend(pair);

        res.result = hash.toHex();
      }),
    }),
  );

  return engine;
};
