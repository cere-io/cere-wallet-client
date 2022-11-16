import { ProviderEngine, ProviderEngineOptions } from './engine';

export type WalletEngine = ProviderEngine;

export const createWalletEngine = (options: ProviderEngineOptions) => {
  return new ProviderEngine(options);
};
