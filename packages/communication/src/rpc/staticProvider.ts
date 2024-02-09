import { providers } from 'ethers';
import { DEFAULT_NETWORK } from '../constants';

interface InternalConnection {
  url?: string;
}

const providerCache = new Map<string, providers.StaticJsonRpcProvider>();

export const getStaticProvider = (web3Provider: providers.Web3Provider): providers.StaticJsonRpcProvider => {
  let rpcUrl: string | undefined;

  const internalProvider = web3Provider.provider;

  if (typeof internalProvider === 'string') {
    rpcUrl = internalProvider;
  } else if (internalProvider && 'connection' in internalProvider && internalProvider.connection) {
    if (typeof internalProvider.connection === 'string') {
      rpcUrl = internalProvider.connection;
    } else if (checkInternalConnection(internalProvider.connection)) {
      rpcUrl = internalProvider.connection.url;
    }
  }

  if (!rpcUrl) {
    console.log('Failed to extract RPC URL from Web3Provider, using default network');
    rpcUrl = DEFAULT_NETWORK.host;
  }

  if (providerCache.has(rpcUrl)) {
    return providerCache.get(rpcUrl)!;
  }

  const staticProvider = new providers.StaticJsonRpcProvider(rpcUrl);
  providerCache.set(rpcUrl, staticProvider);

  return staticProvider;
};

const checkInternalConnection = (internalConnection: {}): internalConnection is InternalConnection => {
  return 'url' in internalConnection;
};
