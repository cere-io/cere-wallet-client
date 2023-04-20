import { useCallback, useState } from 'react';
import { getGlobalStorage } from '@cere-wallet/storage';

export const useAlertVisible = (key: string) => {
  const alertStorageKey = `cere-wallet:alert-visibility:${key}`;
  const [isAlertVisible, setAlertVisible] = useState(!getGlobalStorage().getItem(alertStorageKey));

  const hideAlert = useCallback(() => {
    setAlertVisible(false);

    getGlobalStorage().setItem(alertStorageKey, 'true');
  }, [alertStorageKey]);

  return [isAlertVisible, hideAlert] as const;
};
