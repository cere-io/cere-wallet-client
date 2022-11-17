import { useCallback } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { IHostConfig } from '@ramp-network/ramp-instant-sdk/dist/types/types';

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
    if (process.env.REACT_APP_ENV !== 'prod') {
      config.url = 'https://ri-widget-staging.firebaseapp.com/';
      config.hostApiKey = process.env.REACT_APP_RAMP_API_KEY;
    }
    new RampInstantSDK(config).show();
  }, [address]);

  return { startPayment };
};
