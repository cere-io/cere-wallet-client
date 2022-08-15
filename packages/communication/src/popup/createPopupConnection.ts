import { ConsoleLike } from '@toruslabs/openlogin-jrpc';

import { createBradcastChannel } from './createBroadcastChannel';

export type PopupConnection<T = unknown> = {
  readonly channel: string;
  update: (state: T) => Promise<void>;
};

export type PopupConnectionOptions<T = unknown> = {
  logger?: ConsoleLike;
  onUpdate: (state: T) => void;
  onHandshake: () => void;
};

type Message =
  | {
      name: 'handshake';
      payload: boolean;
    }
  | {
      name: 'update';
      payload: any;
    };

export const createPopupConnection = <T = unknown>(
  channel: string,
  { logger, onUpdate, onHandshake }: PopupConnectionOptions<T>,
): PopupConnection<T> => {
  let prevState: T | undefined;
  const { publish, subscribe } = createBradcastChannel<Message>(channel, logger);

  subscribe(({ name, payload }) => {
    if (name === 'update') {
      onUpdate(payload);
    }

    if (name === 'handshake') {
      onHandshake();

      if (!payload) {
        publish({ name: 'handshake', payload: true });

        if (prevState) {
          publish({ name: 'update', payload: prevState });
        }
      }
    }
  });

  publish({ name: 'handshake', payload: false });

  return {
    channel,
    update: (state) => {
      prevState = state;

      return publish({ name: 'update', payload: state });
    },
  };
};
