import { createAsyncMiddleware, createScaffoldMiddleware } from 'json-rpc-engine';
import { u8aToHex } from '@polkadot/util';
import nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';

import { Engine } from './engine';
import { getKeyPair } from '../accounts';

export type SolanaEngineOptions = {
  getPrivateKey: () => string | undefined;
};

export const createSolanaEngine = ({ getPrivateKey }: SolanaEngineOptions) => {
  const engine = new Engine();

  const getPair = (address: string) => {
    const privateKey = getPrivateKey();

    if (!privateKey) {
      throw new Error('No private key was provided!');
    }

    return getKeyPair({ type: 'solana', privateKey });
  };

  engine.push(
    createScaffoldMiddleware({
      /**
       * Sign a message with solana keypair
       * https://solana.com/developers/cookbook/wallets/sign-message
       *
       * TODO: Rethink the implementation later after the solana blockchain hackathon
       */
      solana_signMessage: createAsyncMiddleware(async (req, res) => {
        const [address, message] = req.params as string[];
        const pair = getPair(address);

        const messageBytes = decodeUTF8(message);
        const signature = nacl.sign.detached(messageBytes, pair.secretKey);

        res.result = u8aToHex(signature);
      }),
    }),
  );

  return engine;
};
