import ReactDOM from 'react-dom/client';

import { App } from './App';
window.process = process;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
