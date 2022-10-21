import { ChainConfig } from '@cere-wallet/wallet-engine';
import { NetworkInterface } from './channels';

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

export const getChainConfig = (network: NetworkInterface): ChainConfig => {
  let chainConfig: Partial<ChainConfig> = {
    chainNamespace: 'eip155',
    chainId: network.chainId ? `0x${network.chainId.toString(16)}` : undefined,
    rpcTarget: network.host,
    displayName: network.networkName,
    blockExplorer: network.blockExplorer,
    ticker: network.ticker,
    tickerName: network.tickerName,
  };

  if (network.chainId === 137 || network.host === 'matic') {
    Object.assign(chainConfig, {
      chainId: '0x89',
      rpcTarget: 'https://polygon-rpc.com',
      displayName: 'Polygon Mainnet',
      blockExplorer: 'https://polygonscan.com',
      ticker: 'MATIC',
      tickerName: 'Polygon',
    });
  }

  if (network.chainId === 80001 || network.host === 'mumbai') {
    Object.assign(chainConfig, {
      chainId: '0x13881',
      rpcTarget: 'https://rpc.ankr.com/polygon_mumbai',
      displayName: 'Polygon Mumbai Testnet',
      blockExplorer: 'https://mumbai.polygonscan.com/',
      ticker: 'MATIC',
      tickerName: 'Polygon',
    });
  }

  if (!isConfigReady(chainConfig)) {
    throw new Error('Incorrect network configuration');
  }

  return chainConfig;
};
