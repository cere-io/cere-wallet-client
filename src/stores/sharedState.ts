import { action, observable, reaction, toJS } from 'mobx';
import { createPopupConnection, PopupConnectionOptions } from '@cere-wallet/communication';

export type SharedState<T = unknown> = {
  state: T;
  readonly isConnected: boolean;
  disconnect: () => Promise<void>;
};

export type SharedStateOptions = Pick<PopupConnectionOptions, 'readOnly'>;

export const createSharedState = <T = unknown>(
  channel: string,
  initialState: T,
  { readOnly = false }: SharedStateOptions = {},
): SharedState<T> => {
  let shouldSync = true;
  const shared = observable(
    {
      isConnected: false,
      state: initialState,
      disconnect: () => connection.disconnect(),
    },
    {
      state: observable.deep,
    },
  );

  const connection = createPopupConnection<T>(channel, {
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
    }),
  });

  if (readOnly) {
    return shared;
  }

  /**
   * Synchronize state between all instances on the channel
   */
  reaction(
    () => toJS(shared.state),
    (state) => {
      if (shouldSync) {
        connection.publish(state);
      }

      shouldSync = true;
    },
    {
      delay: 10, // Small delay to throttle state sync
    },
  );

  return shared;
};

// Preconfigured shared states

export type RedirectState = {
  url: string | null;
};

export const createSharedRedirectState = (instanceId: string) =>
  createSharedState<RedirectState>(`redirect.${instanceId}`, { url: null });

export const createSharedPopupState = <T = unknown>(instanceId: string, initialState: T) =>
  createSharedState<T>(`popup.${instanceId}`, initialState);

export const createSharedWalletState = <T = unknown>(instanceId: string, initialState: T) =>
  createSharedState<T>(`wallet.${instanceId}`, initialState);
