import { createContext, useContext } from 'react';
import { matchRoutes, renderMatches, To } from 'react-router-dom';

import { getRoutes } from './AppRouter';

const Context = createContext<any>(null);

export const useRouteElementContext = <T extends {} = any>() => {
  const context = useContext(Context);

  return (context as T) || null;
};

type RouteElementProps<T extends {} = any> = {
  path: To;
  baseName?: string;
  context?: T;
};

export const RouteElement = <T extends {} = any>({ path, baseName, context }: RouteElementProps<T>) => {
  const matches = matchRoutes(getRoutes(), path, baseName);
  const element = renderMatches(matches);

  return <Context.Provider value={context}>{element}</Context.Provider>;
};
