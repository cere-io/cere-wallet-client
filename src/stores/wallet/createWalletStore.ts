import { action, observable } from 'mobx';

export type WalletStore = {
  readonly ticks: number;
  stop: () => void;
  start: () => void;
  reset: () => void;
};

export const createWalletStore = (): WalletStore => {
  let interval: ReturnType<typeof setInterval>;

  const state = observable({
    count: 0,
  });

  const tick = action(() => {
    state.count += 1;
  });

  const reset = action(() => {
    state.count = 0;
  });

  const stop = () => {
    clearInterval(interval);
  };

  const start = () => {
    interval = setInterval(tick, 1000);
  };

  return {
    stop,
    start,
    reset,

    get ticks() {
      return state.count;
    },
  };
};
