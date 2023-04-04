import { providers } from 'ethers';
import { createERC20Contract } from '../contracts';
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
  const cereTokenAddress = '0xd111d479e23A8342A81ad595Ea1CAF229B3528c3';
  const providerFactory: EthereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig },
  });

  const getProvider = async () => {
    const privateKey = getPrivateKey();

    if (!providerFactory.provider && privateKey) {
      const { secretKey } = getKeyPair({ type: 'ethereum', privateKey });

      await providerFactory.setupProvider(secretKey.toString('hex'));
    }

    if (!providerFactory.provider) {
      throw new Error('Ethereum provider is not ready!');
    }

    return providerFactory.provider;
  };

  const engine = new EthereumEngine();
  engine.attachProviderEvents(providerFactory);

  const getEthereumAccounts = () => getAccounts().filter((account) => account.type === 'ethereum');
  const accountsMiddleware = createAsyncMiddleware(async (req, res) => {
    res.result = getEthereumAccounts().map((account) => account.address);
  });

  const startBalanceListener = async (address: string) => {
    const provider = await getProvider();
    const web3 = new providers.Web3Provider(provider);
    const erc20 = createERC20Contract(web3.getSigner(), cereTokenAddress);

    const listener = async () => {
      const balance = await erc20.balanceOf(address);

      engine.emit('message', {
        type: 'eth_balanceChanged',
        data: { balance: balance.toString() },
      });
    };

    listener();

    const receiveFilter = erc20.filters.Transfer(null, address);
    const sendFilter = erc20.filters.Transfer(address);

    web3.on(receiveFilter, listener);
    web3.on(sendFilter, listener);
  };

  engine.push(
    createScaffoldMiddleware({
      eth_accounts: accountsMiddleware,
      eth_requestAccounts: accountsMiddleware,

      wallet_updateAccounts: createAsyncMiddleware(async (req, res) => {
        const accounts = getEthereumAccounts();
        const [account] = accounts;

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
          type: 'eth_accountChanged',
          data: account,
        });

        if (account) {
          startBalanceListener(account.address);
        }

        res.result = true;
      }),

      eth_transfer: createAsyncMiddleware(async (req, res) => {
        const [from, to, value] = req.params as [string, string, string];
        const provider = await getProvider();
        const web3 = new providers.Web3Provider(provider);
        const erc20 = createERC20Contract(web3.getSigner(), cereTokenAddress);

        const { hash } = await erc20.transfer(to, value, { from });

        res.result = hash;
      }),
    }),
  );

  engine.push(
    createAsyncMiddleware(async (req, res) => {
      const provider = await getProvider();

      try {
        res.result = await provider.request(req);
      } catch (error) {
        if (error instanceof Error) {
          res.error = error;
        }
      }
    }),
  );

  return engine;
};
