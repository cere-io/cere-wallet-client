import { useCallback, useState } from 'react';

const alertStorageKey = 'cere-wallet:hideTopUpAlert';

export const useAlertVisible = () => {
  /**
   * TODO: In this temp implementation the state of alert is stored in localStorage directly
   *
   * In the future we need to add some storage helper and move such flags to user preferences
   */
  const [isAlertVisible, setAlertVisible] = useState(!localStorage.getItem(alertStorageKey));

  const hideAlert = useCallback(() => {
    setAlertVisible(false);
    localStorage.setItem(alertStorageKey, 'true');
  }, []);

  return [isAlertVisible, hideAlert] as const;
};
