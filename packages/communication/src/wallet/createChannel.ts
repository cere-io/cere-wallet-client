import { ConsoleLike, ObjectMultiplex, Substream } from '@toruslabs/openlogin-jrpc';

type Unsubscribe = () => void;
type Subscribe<I> = (handler: (chunk: I) => void) => Unsubscribe;

export type Channel<I, O> = {
  subscribe: Subscribe<I>;
  publish: (chunk: O) => boolean;
};

export type CreateChannelOptions = {
  mux: ObjectMultiplex;
  logger?: ConsoleLike;
};

export const createChannel = <I, O>(name: string, { mux, logger }: CreateChannelOptions): Channel<I, O> => {
  const stream = mux.getStream(name) as Substream;

  const subscribe: Subscribe<I> = (handler) => {
    const wrappedHandler = (chunk: I) => {
      logger?.debug('Wallet (Incoming)', chunk);

      handler(chunk);
    };

    stream.on('data', wrappedHandler);

    return () => stream.off('data', wrappedHandler);
  };

  return {
    subscribe,
    publish: (chunk) => {
      logger?.debug('Wallet (Outgoing)', chunk);

      return stream.write(chunk);
    },
  };
};
