import { Context } from './types';

export const createContext = (...contexts: (Context | null | undefined)[]): Context => {
  const defaultContext: Context = {
    app: {
      name: window.location.hostname,
      url: window.location.origin,
    },
  };

  return Object.assign({}, defaultContext, ...contexts.filter(Boolean));
};
