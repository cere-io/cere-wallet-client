import { UIProvider } from '@cere-wallet/ui';
import TagManager from 'react-gtm-module';

import { Router } from './routes';
import { CereTourProvider } from '~/components';
import { GTM_ID } from './constants';

if (GTM_ID) {
  TagManager.initialize({ gtmId: GTM_ID });
}

export const App = () => (
  <UIProvider>
    <CereTourProvider steps={[]}>
      <Router />
    </CereTourProvider>
  </UIProvider>
);
