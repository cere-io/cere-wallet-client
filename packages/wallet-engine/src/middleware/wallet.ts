import { CustomChainConfig } from '@web3auth/base';
import { createScaffoldMiddleware, createAsyncMiddleware } from '@toruslabs/openlogin-jrpc';
import { convertAddress } from '../getAccountAddress';

export type WalletMiddlewareOptions = {
  getAccounts: () => string[];
  chainConfig: CustomChainConfig;
};

export const createWalletMiddleware = ({ getAccounts = () => [], chainConfig }: WalletMiddlewareOptions) => {
  return createScaffoldMiddleware({
    wallet_getProviderState: createAsyncMiddleware(async (req, res) => {
      res.result = {
        accounts: getAccounts(),
        chainId: chainConfig.chainId,
        isUnlocked: true,
        networkVersion: chainConfig.chainId,
      };
    }),

    wallet_sendDomainMetadata: createAsyncMiddleware(async (req, res) => {
      res.result = true;
    }),

    eth_requestAccounts: createAsyncMiddleware(async (req, res) => {
      res.result = getAccounts();
    }),

    eth_accounts: createAsyncMiddleware(async (req, res) => {
      res.result = getAccounts();
    }),

    /**
     * TODO: This method should return all accounts in future - not only `polkadot`
     */
    wallet_requestAccounts: createAsyncMiddleware(async (req, res) => {
      res.result = getAccounts().map((address) => convertAddress(address, 'polkadot'));
    }),
  });
};
