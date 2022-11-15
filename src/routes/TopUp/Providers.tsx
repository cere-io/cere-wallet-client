import { Button, Box } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { useAccountStore } from '~/hooks';

const Providers = () => {
  const { account } = useAccountStore();

  const processHandle = useCallback(() => {
    new RampInstantSDK({
      url: 'https://ri-widget-staging.firebaseapp.com/',
      hostAppName: 'Cere Wallet',
      hostLogoUrl: 'https://rampnetwork.github.io/assets/misc/test-logo.png',
      fiatCurrency: 'USD',
      defaultAsset: 'MATIC_ETH',
      selectedCountryCode: 'US',
      userAddress: account?.address,
      variant: 'embedded-mobile',
      // @ts-ignore
      containerNode: document.getElementById('ramp-container'),
    }).show();
  }, []);

  return (
    <>
      <Box id="ramp-container" sx={{ width: 320, height: 667 }} />
      <Button onClick={processHandle}>Processed with Ramp</Button>
    </>
  );
};

export default observer(Providers);
