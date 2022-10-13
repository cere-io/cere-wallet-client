import { useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePopupStore = <T>(storeFactory: (popupId: string) => T, deps: any[] = []): T => {
  const factoryRef = useRef(storeFactory);
  const [searchParams] = useSearchParams();
  const popupId = searchParams.get('popupId');

  if (!popupId) {
    throw Error('No `popupId` found in query');
  }

  factoryRef.current = storeFactory;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factoryRef.current(popupId), [popupId, ...deps]);
};
