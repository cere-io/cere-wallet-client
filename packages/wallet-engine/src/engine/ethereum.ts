import { providers } from 'ethers';
import { ContractName, createERC20Contract, getContractAddress } from '../contracts';
import { createScaffoldMiddleware, createAsyncMiddleware } from 'json-rpc-engine';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

import { Engine, EngineEventTarget } from './engine';
import { ChainConfig } from '../types';
import { getKeyPair } from '../accounts';

type BiconomyOptions = {
  apiKey: string;
  debug?: boolean;
};

export type EthereumEngineOptions = {
  getPrivateKey: () => string | undefined;
  chainConfig: ChainConfig;
  biconomy?: BiconomyOptions;
  pollingInterval?: number;
};

const createBiconomyProvider = async (provider: providers.ExternalProvider, options: BiconomyOptions) => {
  const { Biconomy } = await import('@biconomy/mexa');

  const biconomyInstance = new Biconomy(provider, {
    ...options,
    contractAddresses: [],
  });

  await biconomyInstance.init();

  return biconomyInstance.provider;
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

export const createEthereumEngine = ({
  getPrivateKey,
  chainConfig,
  biconomy,
  pollingInterval,
}: EthereumEngineOptions) => {
  let biconomyProviderPromise: Promise<providers.ExternalProvider>;
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

    if (!biconomyProviderPromise && biconomy) {
      biconomyProviderPromise = createBiconomyProvider(providerFactory.provider, biconomy);
    }

    return providerFactory.provider;
  };

  const getGaslessProvider = async () => {
    const provider = await getProvider();
    const biconomyProvider = await biconomyProviderPromise;

    return new providers.Web3Provider(biconomyProvider || provider);
  };

  const engine = new EthereumEngine();

  let balanceUnsubscribe: (() => void) | null = null;
  const startBalanceListener = async (address: string) => {
    const tokenAddress = getContractAddress(ContractName.CereToken, chainConfig.chainId); // TODO: make the listener generic for all ERC20
    const provider = await getProvider();
    const web3 = new providers.Web3Provider(provider);
    const erc20 = createERC20Contract(web3.getSigner(), tokenAddress);

    if (pollingInterval) {
      web3.pollingInterval = pollingInterval;
    }

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

    balanceUnsubscribe = () => {
      web3.off(receiveFilter, listener);
      web3.off(sendFilter, listener);

      balanceUnsubscribe = null;
    };
  };

  engine.push(
    createScaffoldMiddleware({
      eth_transfer: createAsyncMiddleware(async (req, res) => {
        const [from, to, value] = req.params as [string, string, string];

        const web3 = await getGaslessProvider();
        const tokenAddress = getContractAddress(ContractName.CereToken, chainConfig.chainId); // TODO: make the handler generic for all ERC20
        const erc20 = createERC20Contract(web3.getSigner(), tokenAddress);

        const { hash } = await erc20.transfer(to, value, { from });

        res.result = hash;
      }),

      eth_subscribeBalance: createAsyncMiddleware(async (req, res) => {
        const [address] = req.params as [string];

        balanceUnsubscribe?.();

        if (address) {
          await startBalanceListener(address);
        }

        res.result = true;
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
