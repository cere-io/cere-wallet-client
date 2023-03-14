import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

import { Engine, EngineEventTarget } from './engine';
import { Account, ChainConfig } from '../types';
import { getKeyPair } from '../accounts';

export type EthereumEngineOptions = {
  getAccounts: () => Account[];
  getPrivateKey: () => string | undefined;
  chainConfig: ChainConfig;
};

class EthereumEngine extends Engine {
  override forwardEvents(toEngine: EngineEventTarget) {
    super.forwardEvents(toEngine);

    /**
     * Forward Ethereum specific events
     */
    this.on('accountsChanged', (payload) => toEngine.emit('accountsChanged', payload));
    this.on('chainChanged', (payload) => toEngine.emit('chainChanged', payload));
  }

  attachProviderEvents(provider: EthereumPrivateKeyProvider) {
    provider.on('accountsChanged', (payload) => this.emit('accountsChanged', payload));
    provider.on('chainChanged', (payload) => this.emit('chainChanged', payload));
  }
}

export const createEthereumEngine = ({ getPrivateKey, getAccounts, chainConfig }: EthereumEngineOptions) => {
  const providerFactory: EthereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const engine = new EthereumEngine();
  engine.attachProviderEvents(providerFactory);

  const getEthereumAccounts = () => getAccounts().filter((account) => account.type === 'ethereum');
  const accountsMiddleware = createAsyncMiddleware(async (req, res) => {
    res.result = getEthereumAccounts().map((account) => account.address);
  });

  engine.push(
    createScaffoldMiddleware({
      eth_accounts: accountsMiddleware,
      eth_requestAccounts: accountsMiddleware,

      wallet_updateAccounts: createAsyncMiddleware(async (req, res) => {
        const accounts = getEthereumAccounts();

        /**
         * Standard eip-1193 event
         */
        engine.emit(
          'accountsChanged',
          accounts.map((account) => account.address),
        );

        /**
         * Custom wallet message
         */
        engine.emit('message', {
          type: 'eth_accountsChanged',
          data: accounts,
        });

        res.result = true;
      }),
    }),
  );

  engine.push(
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
  );

  return engine;
};
