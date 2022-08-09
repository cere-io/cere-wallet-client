import { ObjectMultiplex, JRPCEngine, Substream, createEngineStream, ConsoleLike } from '@toruslabs/openlogin-jrpc';
import { createLoggerMiddleware } from './middleware';

export type RpcConnection = {
  readonly rpcStream: ReturnType<typeof createEngineStream>;
};

export type RpcConnectionOptions = {
  logger?: ConsoleLike;
};

export const createRpcConnection = (mux: ObjectMultiplex, { logger }: RpcConnectionOptions): RpcConnection => {
  const engine = new JRPCEngine();
  const engineStream = createEngineStream({ engine });
  const providerStream = mux.getStream('provider') as Substream;

  if (logger) {
    engine.push(createLoggerMiddleware(logger));
  }

  /**
   * Forward requests from `providerStream` to `engineStream` and back
   */
  providerStream.pipe(engineStream).pipe(providerStream);

  return {
    rpcStream: engineStream,
  };
};
