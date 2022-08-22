import { UIProvider } from '@cere-wallet/ui';

import { Router } from './routes';

export const App = () => {
  return (
    <UIProvider>
      <Router />
    </UIProvider>
  );
};
