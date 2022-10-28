import type { NetworkConfig } from '@cere/embed-wallet';

export const DEFAULT_NETWORK: NetworkConfig = {
  host: process.env.REACT_APP_DEFAULT_RPC || 'matic',
  chainId: process.env.REACT_APP_DEFAULT_CHAIN_ID ? Number(process.env.REACT_APP_DEFAULT_CHAIN_ID) : undefined,
};
