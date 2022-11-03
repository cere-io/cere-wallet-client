import { useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const usePopupStore = <T>(storeFactory: (popupId: string) => T, deps: any[] = []): T => {
  const factoryRef = useRef(storeFactory);
  const { search, state } = useLocation();

  const popupId = useMemo(
    () => state?.preopenInstanceId || new URLSearchParams(search).get('preopenInstanceId'),
    [search, state],
  );

  if (!popupId) {
    throw Error('No `preopenInstanceId` found in query');
  }

  factoryRef.current = storeFactory;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factoryRef.current(popupId), [popupId, ...deps]);
};
