import type { ChainConfig } from '@cere-wallet/wallet-engine';
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

  amoy: {
    chainId: '0x13882',
    rpcTarget: 'https://rpc-amoy.polygon.technology',
    displayName: 'Polygon Amoy Testnet',
    blockExplorer: 'https://www.oklink.com/amoy',
    ticker: 'MATIC',
    tickerName: 'Matic',
  },
  sepolia: {
    chainId: '84532',
    rpcTarget: 'https://sepolia.base.org',
    displayName: 'Base Sepolia Testnet',
    blockExplorer: 'https://sepolia-explorer.base.org',
    ticker: 'ETH',
    tickerName: 'ETH',
  },
  baseSepolia: {
    chainId: '8453',
    rpcTarget: 'https://mainnet.base.org',
    displayName: 'Base Mainnet',
    blockExplorer: 'https://base.blockscout.com/',
    ticker: 'ETH',
    tickerName: 'ETH',
  },
};

const isConfigReady = (config: Partial<ChainConfig>): config is ChainConfig =>
  ![config.rpcTarget, config.chainId, config.blockExplorer, config.displayName, config.ticker, config.tickerName].some(
    (value) => !value,
  );

const createChainConfig = (network: Partial<NetworkConfig>, preset?: keyof typeof presets): Partial<ChainConfig> => {
  const defaults: Partial<ChainConfig> = preset ? presets[preset] : {};

  return {
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

  if (network.chainId === 80002 || network.host === 'amoy') {
    chainConfig = createChainConfig(network, 'amoy');
  }

  if (network.chainId === 8453 || network.host === 'sepolia') {
    chainConfig = createChainConfig(network, 'sepolia');
  }

  if (network.chainId === 84532 || network.host === 'baseSepolia') {
    chainConfig = createChainConfig(network, 'baseSepolia');
  }

  if (!isConfigReady(chainConfig)) {
    throw new Error('Incorrect network configuration');
  }

  return chainConfig;
};
