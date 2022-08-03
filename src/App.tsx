import { StrictMode } from 'react';
import { UIProvider } from '@cere-wallet/ui';

import { Router } from './routes';

export const App = () => (
  <StrictMode>
    <UIProvider>
      <Router />
    </UIProvider>
  </StrictMode>
);
