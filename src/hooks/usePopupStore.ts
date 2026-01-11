import { useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { useRouteElementContext } from '~/routes';

export const usePopupStore = <T>(storeFactory: (popupId: string, local: boolean) => T, deps: any[] = []): T => {
  const factoryRef = useRef(storeFactory);
  const context = useRouteElementContext();

  const { search, state, hash } = useLocation();
  const popupId = useMemo(() => {
    const params = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.slice(1));

    // Check for standard popup ID parameters
    const standardPopupId =
      context?.preopenInstanceId ||
      state?.preopenInstanceId ||
      params.get('preopenInstanceId') ||
      params.get('popupId');

    if (standardPopupId) {
      return standardPopupId;
    }

    // Handle Web3Auth redirect scenario - check for session information in hash
    const sessionNamespace = params.get('sessionNamespace') || hashParams.get('sessionNamespace');
    const b64Params = hashParams.get('b64Params');
    if (sessionNamespace && b64Params) {
      // Generate a temporary popup ID for redirect scenarios
      return `redirect-${sessionNamespace}-${Date.now()}`;
    }

    return null;
  }, [search, state, hash, context]);

  if (!popupId) {
    throw Error('No `preopenInstanceId` found in query');
  }

  factoryRef.current = storeFactory;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factoryRef.current(popupId, !!context?.preopenInstanceId), [popupId, ...deps]);
};
