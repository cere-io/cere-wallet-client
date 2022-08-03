import { action, observable } from 'mobx';
import { useLocalObservable } from 'mobx-react-lite';

const createStore = () => {
  let interval: ReturnType<typeof setInterval>;

  const state = observable({
    count: 0,
  });

  const tick = action(() => {
    state.count += 1;
  });

  return {
    get ticks() {
      return state.count;
    },

    stop: () => clearInterval(interval),
    start: () => {
      interval = setInterval(tick, 1000);
    },
  };
};

export const useWalletStore = () => useLocalObservable(createStore);
