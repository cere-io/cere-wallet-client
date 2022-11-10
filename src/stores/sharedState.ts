import { action, observable, reaction, toJS, when, IReactionDisposer } from 'mobx';
import { createPopupConnection, PopupConnectionOptions, PopupConnection } from '@cere-wallet/communication';

export type SharedState<T = unknown> = {
  state: T;
  readonly isConnected: boolean;
  disconnect: () => Promise<void>;
};

export type SharedStateOptions = Pick<PopupConnectionOptions, 'readOnly'> & {
  local?: boolean;
};

const localMap: Record<string, SharedState<any>> = {};

export const createSharedState = <T = unknown>(
  channel: string,
  initialState: T,
  { readOnly = false, local = false }: SharedStateOptions = {},
): SharedState<T> => {
  if (local && localMap[channel]) {
    return localMap[channel];
  }

  let connection: PopupConnection<T> | undefined;
  let dispose = () => {};
  let shouldSync = true;

  const shared = observable(
    {
      isConnected: local,
      state: initialState,
      disconnect: async () => {
        delete localMap[channel];

        shared.isConnected = false;

        return connection?.disconnect();
      },
    },
    {
      state: observable.deep,
    },
  );

  if (local) {
    localMap[channel] = shared;

    return shared;
  }

  connection = createPopupConnection<T>(channel, {
    readOnly,
    logger: console,
    initialState: toJS(shared.state),
    onData: action((state) => {
      shouldSync = false;
      shared.state = state;
    }),

    onConnect: action(() => {
      shared.isConnected = true;
    }),

    onDisconnect: action(() => {
      shared.isConnected = false;
      dispose();
    }),
  });

  if (readOnly) {
    return shared;
  }

  /**
   * Synchronize state between all instances on the channel
   */

  let disposeWhenReaction: IReactionDisposer;

  dispose = reaction(
    () => toJS(shared.state),
    (state) => {
      if (!shouldSync) {
        shouldSync = true;

        return;
      }

      if (disposeWhenReaction) {
        disposeWhenReaction();
      }

      disposeWhenReaction = when(
        () => shared.isConnected,
        () => connection?.publish(state),
      );
    },
  );

  return shared;
};

// Preconfigured shared states

export type RedirectState = {
  url: string | null;
};

export const createSharedRedirectState = (instanceId: string, options?: SharedStateOptions) =>
  createSharedState<RedirectState>(`redirect.${instanceId}`, { url: null }, options);

export const createSharedPopupState = <T = unknown>(
  instanceId: string,
  initialState: T,
  options?: SharedStateOptions,
) => createSharedState<T>(`popup.${instanceId}`, initialState, options);
