import ReactDOM from 'react-dom/client';

import Reporting from './reporting';
import { APP_VERSION } from './constants';
import App from './App';

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
