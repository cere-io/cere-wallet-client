import { UIProvider } from '@cere-wallet/ui';
import { CereTourProvider } from '~/components/ProductTours';
import { Router } from './routes';

export const App = () => (
  <UIProvider>
    <CereTourProvider steps={[]}>
      <Router />
    </CereTourProvider>
  </UIProvider>
);
