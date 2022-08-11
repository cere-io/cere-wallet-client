import { action, observable, reaction, toJS } from 'mobx';
import { createPopupConnection } from '@cere-wallet/communication';

export type SharedState<T = any> = {
  isConnected: boolean;
  state: T;
};

export const createSharedState = <T = any>(channel: string, initialState: T): SharedState<T> => {
  const shared = observable<SharedState<T>>({
    isConnected: false,
    state: initialState,
  });

  const sync = { shouldSync: true };
  const connection = createPopupConnection<T>(channel, {
    logger: console,
    onUpdate: action((state) => {
      sync.shouldSync = false;
      Object.assign(shared.state, state);
    }),

    onHandshake: action(() => {
      shared.isConnected = true;
    }),
  });

  /**
   * Synchronize state between all instances on the channel
   */
  reaction(
    () => toJS(shared.state),
    (state) => {
      if (sync.shouldSync) {
        connection.update(state);
      }

      sync.shouldSync = true;
    },
  );

  return shared;
};
