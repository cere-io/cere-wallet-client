import { action, observable, reaction, toJS, when, IReactionDisposer } from 'mobx';
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

  let disposeWhenReaction: IReactionDisposer;

  reaction(
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
        () => connection.publish(state),
      );
    },
  );

  return shared;
};

// Preconfigured shared states

export type RedirectState = {
  url: string | null;
};

export type AuthState = {
  privateKey?: string;
};

export const createSharedRedirectState = (instanceId: string) =>
  createSharedState<RedirectState>(`redirect.${instanceId}`, { url: null });

export const createSharedPopupState = <T = unknown>(instanceId: string, initialState: T) =>
  createSharedState<T>(`popup.${instanceId}`, initialState);
