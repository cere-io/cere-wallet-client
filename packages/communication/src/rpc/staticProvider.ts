import { providers } from 'ethers';
import { DEFAULT_NETWORK } from '../constants';
import { TorusInpageProvider } from '@cere/torus-embed';
import { ProviderInterface, ProxyProvider } from 'packages/embed-wallet/src/Provider';

interface InternalConnection {
  url?: string;
}

const providerCache = new Map<string, providers.StaticJsonRpcProvider>();

type SupportedProvider = providers.Web3Provider | TorusInpageProvider | ProxyProvider | ProviderInterface;

export const getStaticProvider = (provider?: SupportedProvider): providers.StaticJsonRpcProvider => {
  let rpcUrl: string | undefined;

  if (!provider || !('provider' in provider)) {
    return cacheNewStaticProvider(DEFAULT_NETWORK.host);
  }

  const internalProvider = provider instanceof ProxyProvider ? new providers.Web3Provider(provider) : provider.provider;

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
    rpcUrl = DEFAULT_NETWORK.host;
  }

  if (providerCache.has(rpcUrl)) {
    return providerCache.get(rpcUrl)!;
  }

  return cacheNewStaticProvider(rpcUrl);
};

const cacheNewStaticProvider = (rpcUrl: string): providers.StaticJsonRpcProvider => {
  const staticProvider = new providers.StaticJsonRpcProvider(rpcUrl);
  providerCache.set(rpcUrl, staticProvider);
  return staticProvider;
};

const checkInternalConnection = (internalConnection: {}): internalConnection is InternalConnection => {
  return 'url' in internalConnection;
};
