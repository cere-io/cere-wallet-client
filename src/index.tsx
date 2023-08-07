import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';

import Reporting from './reporting';
import { GTM_ID } from './constants';
import { App } from '~/app';

if (GTM_ID) {
  TagManager.initialize({ gtmId: GTM_ID });
}

/**
 * Init reporting asynchronously
 */
Reporting.init();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
