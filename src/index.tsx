import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';
import { UIProvider } from '@cere-wallet/ui';

import { Router } from './routes';
import { GTM_ID } from './constants';

if (GTM_ID) {
  TagManager.initialize({ gtmId: GTM_ID });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <UIProvider>
    <Router />
  </UIProvider>,
);
