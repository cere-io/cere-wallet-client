import { createScaffoldMiddleware, createAsyncMiddleware, mergeMiddleware } from 'json-rpc-engine';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

import { Account, ChainConfig } from '../types';
import { getKeyPair } from '../accounts';

export type EthereumMiddlewareOptions = {
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
  chainConfig: ChainConfig;
};

export const createEthereumMiddleware = ({ getPrivateKey, getAccounts, chainConfig }: EthereumMiddlewareOptions) => {
  const providerFactory: EthereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const accountsMiddleware = createAsyncMiddleware(async (req, res) => {
    res.result = getAccounts()
      .filter((account) => account.type === 'ethereum')
      .map((account) => account.address);
  });

  return mergeMiddleware([
    createScaffoldMiddleware({
      eth_accounts: accountsMiddleware,
      eth_requestAccounts: accountsMiddleware,
    }),

    createAsyncMiddleware(async (req, res) => {
      const privateKey = getPrivateKey();

      if (!providerFactory.provider && privateKey) {
        const { secretKey } = getKeyPair({ type: 'ethereum', privateKey });

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
