import { Context, PartialContext } from './types';

export const createContext = (...contexts: (PartialContext | null | undefined)[]) => {
  const context: PartialContext = Object.assign({}, ...contexts.filter(Boolean));

  /**
   * Apply defaults
   */
  context.app ||= {};
  context.app.url ||= window.location.href;

  return context as Context;
};
