import { useCallback } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { IHostConfig } from '@ramp-network/ramp-instant-sdk/dist/types/types';
import { REACT_APP_RAMP_API_KEY } from '~/constants';

interface RampProps {
  address: string;
}

export const useRamp = ({ address }: RampProps) => {
  const startPayment = useCallback(() => {
    const config: IHostConfig = {
      hostAppName: 'Cere Wallet',
      hostLogoUrl: 'https://wallet.cere.io/favicon.png',
      defaultAsset: 'MATIC',
      userAddress: address,
      variant: 'hosted-auto',
    };
    if (process.env.REACT_APP_ENV === 'prod') {
      config.hostApiKey = REACT_APP_RAMP_API_KEY;
    } else {
      config.url = 'https://ri-widget-staging.firebaseapp.com/';
    }
    new RampInstantSDK(config).show();
  }, [address]);

  return { startPayment };
};
