import { ChainConfig } from '@cere-wallet/wallet-engine';
import { InitChannelIn } from './channels';

export const getChainConfig = (network: InitChannelIn['data']['network']): ChainConfig => {
  let defaultConfig: Partial<ChainConfig> = {};

  if (network.chainId === 137) {
    defaultConfig = {
      chainNamespace: 'eip155',
      chainId: '0x89',
      rpcTarget: 'https://rpc.ankr.com/polygon',
      displayName: 'Polygon Mainnet',
      blockExplorer: 'https://polygonscan.com',
      ticker: 'MATIC',
      tickerName: 'Polygon',
    };
  }

  if (network.chainId === 80001) {
    defaultConfig = {
      chainNamespace: 'eip155',
      chainId: '0x13881',
      rpcTarget: 'https://rpc.ankr.com/polygon_mumbai',
      displayName: 'Polygon Mumbai Testnet',
      blockExplorer: 'https://mumbai.polygonscan.com/',
      ticker: 'MATIC',
      tickerName: 'Polygon',
    };
  }

  return {
    chainNamespace: 'eip155',
    chainId: `0x${network.chainId.toString(16)}`,
    rpcTarget: network.host ?? defaultConfig.rpcTarget,
    displayName: network.networkName ?? defaultConfig.displayName,
    blockExplorer: network.blockExplorer ?? defaultConfig.blockExplorer,
    ticker: network.ticker ?? defaultConfig.ticker,
    tickerName: network.tickerName ?? defaultConfig.tickerName,
  };
};
