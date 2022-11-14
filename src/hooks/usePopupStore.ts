import { useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useRouteElementContext } from '~/routes';

export const usePopupStore = <T>(storeFactory: (popupId: string, local: boolean) => T, deps: any[] = []): T => {
  const factoryRef = useRef(storeFactory);
  const context = useRouteElementContext();

  const { search, state } = useLocation();
  const popupId = useMemo(
    () =>
      context?.preopenInstanceId || state?.preopenInstanceId || new URLSearchParams(search).get('preopenInstanceId'),
    [search, state, context],
  );

  if (!popupId) {
    throw Error('No `preopenInstanceId` found in query');
  }

  factoryRef.current = storeFactory;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factoryRef.current(popupId, !!context?.preopenInstanceId), [popupId, ...deps]);
};
