import { ObjectMultiplex, Substream } from '@toruslabs/openlogin-jrpc';

type Unsubscribe = () => void;
type Subscribe<I> = (handler: (chunk: I) => void) => Unsubscribe;

export type Channel<I, O> = {
  subscribe: Subscribe<I>;
  publish: (chunk: O) => boolean;
};

export const createChannel = <I, O>(mux: ObjectMultiplex, name: string): Channel<I, O> => {
  const stream = mux.getStream(name) as Substream;

  const subscribe: Subscribe<I> = (handler) => {
    stream.on('data', handler);

    return () => stream.off('data', handler);
  };

  return {
    subscribe,
    publish: (chunk) => stream.write(chunk),
  };
};
