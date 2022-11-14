import { createScaffoldMiddleware, createAsyncMiddleware, mergeMiddleware } from 'json-rpc-engine';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

import { ChainConfig } from '../types';
import { getKeyPair, getAccount } from '../accounts';

export type EthereumMiddlewareOptions = {
  getPrivateKey: () => string | undefined;
  chainConfig: ChainConfig;
};

export const createEthereumMiddleware = ({ getPrivateKey, chainConfig }: EthereumMiddlewareOptions) => {
  const providerFactory: EthereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const accountsMiddleware = createAsyncMiddleware(async (req, res, next) => {
    const privateKey = getPrivateKey();

    res.result = privateKey ? [getAccount(privateKey).address] : [];
  });

  return mergeMiddleware([
    createScaffoldMiddleware({
      eth_accounts: accountsMiddleware,
      eth_requestAccounts: accountsMiddleware,
    }),

    createAsyncMiddleware(async (req, res) => {
      const privateKey = getPrivateKey();

      if (!providerFactory.provider && privateKey) {
        const { secretKey } = getKeyPair(privateKey, 'ethereum');

        await providerFactory.setupProvider(secretKey.toString('hex'));
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
    }),
  ]);
};
