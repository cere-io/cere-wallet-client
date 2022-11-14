import { useCallback } from 'react';
import { useEmbeddedWalletStore } from '~/hooks';

export const useShowTopUp = () => {
  const { instanceId } = useEmbeddedWalletStore();
  const windowFeatures = 'diretories=0,titlebar=0,toolbar=0,sttus=0,locaion0,menubar=0,height=700,width=1200';

  return useCallback(() => {
    window.open(`wallet/home/topup?integrity=true&instanceId=${instanceId}`, instanceId, windowFeatures);
  }, [instanceId]);
};
