import { CustomChainConfig, SafeEventEmitterProvider } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

export type ChainConfig = CustomChainConfig;
export type Provider = SafeEventEmitterProvider;
export type ProviderOptions = {
  privateKey: string;
  chainConfig: ChainConfig;
};

export const createProvider = async (options: ProviderOptions) => {
  const { provider } = await EthereumPrivateKeyProvider.getProviderInstance({
    privKey: options.privateKey,
    chainConfig: options.chainConfig,
  });

  if (!provider) {
    throw new Error('Error creating wallet engine provider');
  }

  return provider;
};
