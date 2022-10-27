import { Context } from './types';

export const createContext = (...contexts: (Context | null | undefined)[]): Context => {
  const defaultContext: Context = {
    app: {
      url: window.location.origin,
    },
  };

  return Object.assign({}, defaultContext, ...contexts.filter(Boolean));
};
