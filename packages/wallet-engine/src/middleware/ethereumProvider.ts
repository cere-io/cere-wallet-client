import { CustomChainConfig } from '@web3auth/base';
import { JRPCMiddleware } from '@toruslabs/openlogin-jrpc';
import { ethersProviderAsMiddleware } from 'eth-json-rpc-middleware';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

export type ChainConfig = CustomChainConfig;
export type EthereumProviderMiddlewareOptions = {
  privateKey: string;
  chainConfig: ChainConfig;
};

export const createEthereumProviderMiddleware = async ({
  chainConfig,
  privateKey,
}: EthereumProviderMiddlewareOptions) => {
  const { provider } = await EthereumPrivateKeyProvider.getProviderInstance({
    privKey: privateKey,
    chainConfig,
  });

  const middleware: JRPCMiddleware<unknown, unknown> = provider
    ? (ethersProviderAsMiddleware(provider) as JRPCMiddleware<unknown, unknown>)
    : (req, res, next) => next();

  return middleware;
};
