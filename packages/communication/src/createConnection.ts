import { createMux } from './createMux';
import { createWalletConnection, WalletConnection, WalletConnectionOptions } from './wallet';
import { createRpcConnection, RpcConnection, RpcConnectionOptions } from './rpc';

export type Connection = RpcConnection & WalletConnection;
export type ConnectionOptions = RpcConnectionOptions & WalletConnectionOptions;

export const createConnection = (options: ConnectionOptions): Connection => {
  const rpcMux = createMux('iframe_metamask', 'embed_metamask');
  const walletMux = createMux('iframe_comm', 'embed_comm').setMaxListeners(50);

  const rpcConnection = createRpcConnection(rpcMux, options);
  const walletConnection = createWalletConnection(walletMux, options);

  return {
    ...rpcConnection,
    ...walletConnection,
  };
};
