import { ConsoleLike } from '@toruslabs/openlogin-jrpc';

import { createBradcastChannel } from './createBroadcastChannel';

export type PopupConnection<T = unknown> = {
  readonly channel: string;
  disconnect: () => Promise<void>;
  publish: (state: T) => Promise<void>;
};

export type PopupConnectionOptions<T = unknown> = {
  logger?: ConsoleLike;
  initialState: T;
  onData: (state: T) => void;
  onDisconnect: () => void;
  onConnect: () => void;
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
  { logger, initialState, onData, onConnect, onDisconnect }: PopupConnectionOptions<T>,
): PopupConnection<T> => {
  let prevState: T = initialState;
  const { publish, subscribe, close } = createBradcastChannel<Message>(channel, logger);

  subscribe(({ name, payload }) => {
    if (name === 'update') {
      onData(payload);
    }

    if (name === 'handshake') {
      onConnect();

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

    disconnect: async () => {
      await close();

      onDisconnect();
    },

    publish: (state) => {
      prevState = state;

      return publish({ name: 'update', payload: state });
    },
  };
};
