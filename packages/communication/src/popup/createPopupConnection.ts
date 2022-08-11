import { BroadcastChannel } from '@toruslabs/broadcast-channel';
import { ConsoleLike } from '@toruslabs/openlogin-jrpc';

export type PopupConnection<T = unknown> = {
  readonly channel: string;
  update: (state: Partial<T>) => Promise<void>;
};

export type PopupConnectionOptions<T> = {
  logger?: ConsoleLike;
  onUpdate: (state: T) => void;
  onHandshake: () => void;
};

export const createPopupConnection = <T = unknown>(
  channel: string,
  { logger, onUpdate, onHandshake }: PopupConnectionOptions<T>,
): PopupConnection<T> => {
  const connextion = new BroadcastChannel(channel);
  const postMessage = (message: any) => {
    logger?.debug('Popup (Outgoing)', channel, message);

    return connextion.postMessage(message);
  };

  connextion.addEventListener('message', ({ name, payload }) => {
    logger?.debug('Popup (Incoming)', channel, { name, payload });

    if (name === 'update') {
      onUpdate(payload);
    }

    if (name === 'handshake') {
      onHandshake();

      if (!payload) {
        postMessage({ name: 'handshake', payload: true });
      }
    }
  });

  postMessage({ name: 'handshake', payload: false });

  return {
    channel,
    update: (payload) => postMessage({ name: 'update', payload }),
  };
};
