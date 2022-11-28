import { useCallback } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { IHostConfig } from '@ramp-network/ramp-instant-sdk/dist/types/types';
import { REACT_APP_RAMP_API_KEY } from '~/constants';

interface RampProps {
  address: string;
  email?: string;
}

export const useRamp = ({ address, email }: RampProps) => {
  const startPayment = useCallback(() => {
    const config: IHostConfig = {
      hostAppName: 'Cere Wallet',
      hostLogoUrl: `${window.origin}/images/logo.svg`,
      userEmailAddress: email,
      userAddress: address,
      variant: 'hosted-auto',
      hostApiKey: REACT_APP_RAMP_API_KEY,
    };
    if (process.env.REACT_APP_ENV === 'prod') {
      config.defaultAsset = 'ETH_USDC';
    } else {
      config.defaultAsset = 'MATIC_USDC';
      config.url = 'https://ri-widget-staging.firebaseapp.com/';
    }
    new RampInstantSDK(config).show();
  }, [address, email]);

  return { startPayment };
};
