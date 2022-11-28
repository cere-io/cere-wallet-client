import { useCallback, useState } from 'react';

export const useAlertVisible = (key: string) => {
  /**
   * TODO: In this temp implementation the state of alert is stored in localStorage directly
   *
   * In the future we need to add some storage helper and move such flags to user preferences
   */
  const alertStorageKey = `cere-wallet:alert-visibility:${key}`;
  const [isAlertVisible, setAlertVisible] = useState(!localStorage.getItem(alertStorageKey));

  const hideAlert = useCallback(() => {
    setAlertVisible(false);
    localStorage.setItem(alertStorageKey, 'true');
  }, [alertStorageKey]);

  return [isAlertVisible, hideAlert] as const;
};
