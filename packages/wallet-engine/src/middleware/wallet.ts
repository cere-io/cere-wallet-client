import { CustomChainConfig } from '@web3auth/base';
import { createScaffoldMiddleware, createAsyncMiddleware } from '@toruslabs/openlogin-jrpc';

export type WalletMiddlewareOptions = {
  accounts: string[];
  chainConfig: CustomChainConfig;
};

export const createWalletMiddleware = ({ accounts, chainConfig }: WalletMiddlewareOptions) => {
  return createScaffoldMiddleware({
    wallet_getProviderState: createAsyncMiddleware(async (req, res) => {
      res.result = {
        accounts,
        chainId: chainConfig.chainId,
        isUnlocked: true,
        networkVersion: chainConfig.chainId,
      };
    }),

    wallet_sendDomainMetadata: createAsyncMiddleware(async (req, res) => {
      res.result = true;
    }),
  });
};
