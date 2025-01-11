import { createAsyncMiddleware, createScaffoldMiddleware } from 'json-rpc-engine';
import { hexToU8a, u8aToHex, u8aWrapBytes } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

import { Engine } from './engine';
import { getKeyPair } from '../accounts';
import { SignerPayloadJSON } from '@polkadot/types/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { AccountInfo } from '@polkadot/types/interfaces';
import nacl from 'tweetnacl';
import { convertPublicKey, convertSecretKey } from 'ed2curve';

export type PolkadotEngineOptions = {
  polkadotRpc: string;
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

export const createPolkadotEngine = ({ getPrivateKey, polkadotRpc }: PolkadotEngineOptions) => {
  const engine = new Engine();
  const api = createApi(polkadotRpc);

  const getPair = (address: string) => {
    const privateKey = getPrivateKey();

    return createPair(address, privateKey);
  };

  const getSecretKey = () => {
    const privateKey = getPrivateKey();
    if (!privateKey) {
      throw new Error('No private key was provided!');
    }

    const { secretKey } = getKeyPair({ type: 'ed25519', privateKey });
    return secretKey;
  };

  const publicKeyEd25519ToCurve25519 = (ed25519PublicKey: string) => {
    const publicKeyCurve25519 = convertPublicKey(hexToU8a(ed25519PublicKey));
    if (!publicKeyCurve25519) {
      throw new Error(`Can't convert ed25519 public key to curve25519!`);
    }
    return publicKeyCurve25519;
  };

  let balanceUnsubscribe: (() => void) | null = null;
  const startBalanceListener = async (address: string) => {
    await api.isReady;

    const unsubscribe: any = await api.query.system.account(address, ({ data }: AccountInfo) => {
      const balance = data.free.toString();

      engine.emit('message', {
        type: 'ed25519_balanceChanged',
        data: { balance },
      });
    });

    balanceUnsubscribe = () => {
      unsubscribe();
      balanceUnsubscribe = null;
    };
  };

  engine.push(
    createScaffoldMiddleware({
      /**
       * @deprecated Use `ed25519_signRaw` instead. This method is unsafe and should not be used.
       *
       * TODO: Remove this method after migrating `@cere/embed-wallet-inject` to use `ed25519_signRaw` and `ed25519_signPayload`.
       */
      ed25519_sign: createAsyncMiddleware(async (req, res) => {
        await api.isReady;

        const [address, message] = req.params as string[];
        const pair = getPair(address);
        const signature = pair.sign(message, { withType: true });

        res.result = u8aToHex(signature);
      }),

      ed25519_signRaw: createAsyncMiddleware(async (req, res) => {
        await api.isReady;

        const [address, message] = req.params as string[];
        const pair = getPair(address);
        const wrappedMessage = u8aWrapBytes(message);
        const signature = pair.sign(wrappedMessage);

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

      ed25519_nacl_secretbox: createAsyncMiddleware(async (req, res) => {
        const [message, path] = req.params as string[];

        let secretKey = getSecretKey();
        let dek = blake2AsU8a(secretKey);

        if (path) {
          dek = blake2AsU8a(Buffer.concat([dek, Buffer.from(`/${path}`)]));
        }

        res.result = u8aToHex(nacl.secretbox(new TextEncoder().encode(message), new Uint8Array(24), dek));
      }),

      ed25519_nacl_secretbox_open: createAsyncMiddleware(async (req, res) => {
        const [secretBox, path] = req.params as string[];

        let secretKey = getSecretKey();
        let dek = blake2AsU8a(secretKey);

        if (path) {
          dek = blake2AsU8a(Buffer.concat([dek, Buffer.from(`/${path}`)]));
        }

        const message = nacl.secretbox.open(hexToU8a(secretBox), new Uint8Array(24), dek);
        if (!message) {
          throw new Error(`Can't open secretbox!`);
        }

        res.result = new TextDecoder().decode(message);
      }),

      ed25519_nacl_box: createAsyncMiddleware(async (req, res) => {
        const [message, theirPublicKey] = req.params as string[];

        const theirPublicKeyCurve25519 = publicKeyEd25519ToCurve25519(theirPublicKey);
        const secretKeyCurve25519 = convertSecretKey(getSecretKey());

        res.result = u8aToHex(
          nacl.box(
            new TextEncoder().encode(message),
            new Uint8Array(24),
            theirPublicKeyCurve25519,
            secretKeyCurve25519,
          ),
        );
      }),

      ed25519_nacl_box_open: createAsyncMiddleware(async (req, res) => {
        const [box, theirPublicKey] = req.params as string[];

        const theirPublicKeyCurve25519 = publicKeyEd25519ToCurve25519(theirPublicKey);
        const secretKeyCurve25519 = convertSecretKey(getSecretKey());

        const message = nacl.box.open(hexToU8a(box), new Uint8Array(24), theirPublicKeyCurve25519, secretKeyCurve25519);
        if (!message) {
          throw new Error(`Can't open box!`);
        }

        res.result = new TextDecoder().decode(message);
      }),

      ed25519_nacl_box_edek: createAsyncMiddleware(async (req, res) => {
        const [theirPublicKey] = req.params as string[];

        const theirPublicKeyCurve25519 = publicKeyEd25519ToCurve25519(theirPublicKey);

        const secretKey = getSecretKey();
        const dek = blake2AsU8a(secretKey);

        const secretKeyCurve25519 = convertSecretKey(secretKey);

        res.result = u8aToHex(nacl.box(dek, new Uint8Array(24), theirPublicKeyCurve25519, secretKeyCurve25519));
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

        const hash = await api.tx.balances.transferAllowDeath(to, value).signAndSend(pair);

        res.result = hash.toHex();
      }),

      ed25519_subscribeBalance: createAsyncMiddleware(async (req, res) => {
        const [address] = req.params as [string];

        balanceUnsubscribe?.();

        if (address) {
          await startBalanceListener(address);
        }

        res.result = true;
      }),
    }),
  );

  return engine;
};
