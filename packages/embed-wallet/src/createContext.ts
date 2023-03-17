import { Context, PartialContext } from './types';

export const createContext = (...contexts: (PartialContext | null | undefined)[]): Context => {
  const defaultContext: Context = {
    app: {
      url: window.location.origin,
    },
  };

  return Object.assign({}, defaultContext, ...contexts.filter(Boolean));
};
