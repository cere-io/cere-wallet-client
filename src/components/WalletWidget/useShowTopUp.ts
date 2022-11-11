import { useCallback } from 'react';
export const useShowTopUp = () => {

  return useCallback(() => {
    window.open('/home/topup');
  }, []);
};
