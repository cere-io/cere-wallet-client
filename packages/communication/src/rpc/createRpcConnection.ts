import { ObjectMultiplex, Substream } from '@toruslabs/openlogin-jrpc';

export type RpcConnection = {
  readonly providerStream: Substream;
};

export type RpcConnectionOptions = {};

export const createRpcConnection = (mux: ObjectMultiplex, options: RpcConnectionOptions): RpcConnection => {
  const providerStream = mux.getStream('provider') as Substream;

  return {
    providerStream,
  };
};
