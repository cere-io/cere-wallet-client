import { WalletEngine } from '@cere-wallet/wallet-engine';
import { ConsoleLike, JRPCEngine, JRPCMiddleware, Substream, createEngineStream } from '@toruslabs/openlogin-jrpc';
import { createMux } from '../createMux';
import { createLoggerMiddleware } from './middleware';

export type RpcStream = ReturnType<typeof createEngineStream>;
export type RpcConnection = {};

export type RpcConnectionOptions = {
  engine: WalletEngine;
  logger?: ConsoleLike;
};

export const createRpcConnection = ({ engine: walletEngine, logger }: RpcConnectionOptions): RpcConnection => {
  const mux = createMux('iframe_metamask', 'embed_metamask');
  const engine = new JRPCEngine();
  const engineStream = createEngineStream({ engine });
  const providerStream = mux.getStream('provider') as Substream;

  if (logger) {
    engine.push(createLoggerMiddleware(logger));
  }

  engine.push(walletEngine.asMiddleware() as JRPCMiddleware<unknown, unknown>);

  /**
   * Forward notifications
   */
  walletEngine.forwardEvents(engine);

  /**
   * Setup duplex stream
   */
  providerStream.pipe(engineStream).pipe(providerStream);

  return {};
};
