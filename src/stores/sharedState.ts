import { action, observable, reaction, toJS, comparer } from 'mobx';
import { createPopupConnection } from '@cere-wallet/communication';

export type SharedState<T extends {} = {}> = {
  state: T;
  readonly isConnected: boolean;
  disconnect: () => Promise<void>;
};

export const createSharedState = <T extends {} = {}>(channel: string, initialState: T): SharedState<T> => {
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

export const createSharedPopupState = <T extends {} = {}>(instanceId: string, initialState: T) =>
  createSharedState<T>(`popup.${instanceId}`, initialState);

export const createSharedWalletState = <T extends {} = {}>(instanceId: string, initialState: T) =>
  createSharedState<T>(`wallet.${instanceId}`, initialState);
