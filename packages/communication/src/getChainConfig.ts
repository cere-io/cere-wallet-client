import { ChainConfig } from '@cere-wallet/wallet-engine';
import type { NetworkConfig } from '@cere/embed-wallet';

const presets = {
  matic: {
    chainId: '0x89',
    rpcTarget: 'https://polygon-rpc.com',
    displayName: 'Polygon Mainnet',
    blockExplorer: 'https://polygonscan.com',
    ticker: 'MATIC',
    tickerName: 'Matic',
  },

  mumbai: {
    chainId: '0x13881',
    rpcTarget: 'https://rpc.ankr.com/polygon_mumbai',
    displayName: 'Polygon Mumbai Testnet',
    blockExplorer: 'https://mumbai.polygonscan.com/',
    ticker: 'MATIC',
    tickerName: 'Matic',
  },
};

const isConfigReady = (config: Partial<ChainConfig>): config is ChainConfig =>
  ![
    config.chainNamespace,
    config.rpcTarget,
    config.chainId,
    config.blockExplorer,
    config.displayName,
    config.ticker,
    config.tickerName,
  ].some((value) => !value);

const createChainConfig = (network: Partial<NetworkConfig>, preset?: keyof typeof presets): Partial<ChainConfig> => {
  const defaults: Partial<ChainConfig> = preset ? presets[preset] : {};

  return {
    chainNamespace: 'eip155',
    chainId: network.chainId ? `0x${network.chainId.toString(16)}` : defaults.chainId,
    rpcTarget: !network.host || network.host === preset ? defaults.rpcTarget : network.host,
    displayName: network.networkName || defaults.displayName,
    blockExplorer: network.blockExplorer || defaults.blockExplorer,
    ticker: network.ticker || defaults.ticker,
    tickerName: network.tickerName || defaults.tickerName,
  };
};

export const getChainConfig = (network: NetworkConfig): ChainConfig => {
  let chainConfig = createChainConfig(network);

  if (network.chainId === 137 || network.host === 'matic') {
    chainConfig = createChainConfig(network, 'matic');
  }

  if (network.chainId === 80001 || network.host === 'mumbai') {
    chainConfig = createChainConfig(network, 'mumbai');
  }

  if (!isConfigReady(chainConfig)) {
    throw new Error('Incorrect network configuration');
  }

  return chainConfig;
};
