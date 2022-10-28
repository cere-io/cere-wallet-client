import { UIProvider } from '@cere-wallet/ui';

import { Router } from './routes';
import { CereTourProvider } from '~/components/ProductTours';

export const App = () => (
  <UIProvider>
    <CereTourProvider steps={[]}>
      <Router />
    </CereTourProvider>
  </UIProvider>
);
