import ReactDOM from 'react-dom/client';
import TagManager from 'react-gtm-module';

import Reporting from './reporting';
import { GTM_ID, APP_VERSION } from './constants';
import App from './App';

if (GTM_ID) {
  TagManager.initialize({ gtmId: GTM_ID });
}

/**
 * Log the version of the wallet client
 */
console.log('Cere Wallet client version:', APP_VERSION);

/**
 * Init reporting asynchronously
 */
Reporting.init();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
