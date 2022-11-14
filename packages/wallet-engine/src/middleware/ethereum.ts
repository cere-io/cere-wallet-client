import { createAsyncMiddleware } from 'json-rpc-engine';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

import { ChainConfig } from '../types';
import { getKeyPair } from '../accounts';

export type EthereumMiddlewareOptions = {
  getPrivateKey: () => string | undefined;
  chainConfig: ChainConfig;
};

export const createEthereumMiddleware = ({ getPrivateKey, chainConfig }: EthereumMiddlewareOptions) => {
  const providerFactory: EthereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  return createAsyncMiddleware(async (req, res) => {
    const privateKey = getPrivateKey();

    if (!providerFactory.provider && privateKey) {
      const { secretKey } = getKeyPair(privateKey, 'ethereum');

      await providerFactory.setupProvider(secretKey);
    }

    if (!providerFactory.provider) {
      throw new Error('Ethereum provider is not ready!');
    }

    try {
      res.result = await providerFactory.provider.request(req);
    } catch (error) {
      if (error instanceof Error) {
        res.error = error;
      }
    }
  });
};
