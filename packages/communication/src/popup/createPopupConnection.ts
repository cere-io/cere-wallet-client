import { ConsoleLike } from '@toruslabs/openlogin-jrpc';

import { createBradcastChannel } from './createBroadcastChannel';

export type PopupConnection<T = unknown> = {
  readonly channel: string;
  disconnect: () => Promise<void>;
  publish: (state: T) => Promise<void>;
};

export type PopupConnectionOptions<T = unknown> = {
  logger?: ConsoleLike;
  readOnly?: boolean;
  initialState: T;
  onData: (state: T) => void;
  onDisconnect: () => void;
  onConnect: () => void;
};

type Message =
  | {
      name: 'handshake';
      payload?: any;
      connected?: boolean;
    }
  | {
      name: 'update';
      payload: any;
    };

export const createPopupConnection = <T = unknown>(
  channel: string,
  { logger, initialState, readOnly = false, onData, onConnect, onDisconnect }: PopupConnectionOptions<T>,
): PopupConnection<T> => {
  let prevState: T = initialState;
  const { publish, subscribe, close } = createBradcastChannel<Message>(channel, logger);

  subscribe((message) => {
    if (message.name === 'update') {
      onData(message.payload);
    }

    if (message.name === 'handshake') {
      onConnect();

      if (message.connected && message.payload) {
        onData(message.payload);
      }

      if (!message.connected) {
        publish({
          name: 'handshake',
          connected: true,
          payload: prevState && !readOnly ? prevState : undefined,
        });
      }
    }
  });

  publish({ name: 'handshake', connected: false });

  return {
    channel,

    disconnect: async () => {
      await close();
      onDisconnect();
    },

    publish: async (state) => {
      if (readOnly) {
        return;
      }

      prevState = state;

      return publish({ name: 'update', payload: state });
    },
  };
};
