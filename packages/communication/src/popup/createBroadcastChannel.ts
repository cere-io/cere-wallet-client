import { BroadcastChannel } from 'broadcast-channel';
import { ConsoleLike } from '@toruslabs/openlogin-jrpc';
import { detectConnectionType } from './detectConnectionType';

export const createBradcastChannel = <T = unknown>(channel: string, logger?: ConsoleLike) => {
  const connection = new BroadcastChannel(channel, {
    type: detectConnectionType(),
    webWorkerSupport: false,
  });

  const publish = (message: T) => {
    logger?.debug('Popup (Outgoing)', channel, message);

    return connection.postMessage(message);
  };

  const subscribe = (handler: (message: T) => void) => {
    connection.addEventListener('message', (message) => {
      logger?.debug('Popup (Incoming)', channel, message);

      handler(message);
    });
  };

  const close = async () => {
    await connection.close();

    logger?.debug('Popup (Closed)', channel);
  };

  return {
    close,
    publish,
    subscribe,
  };
};
