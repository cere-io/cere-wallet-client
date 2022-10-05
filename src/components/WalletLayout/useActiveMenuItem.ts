import { useMemo } from 'react';
import { useMatches } from 'react-router-dom';
import { WalletMenuItem } from './types';

export const useActiveMenuItem = (menu: WalletMenuItem[]) => {
  const matchedRoutes = useMatches();
  const activeMenu = useMemo(
    () => menu.find((item) => matchedRoutes.some((route) => route.pathname === item.path)),
    [menu, matchedRoutes],
  );

  return activeMenu || menu[0];
};
