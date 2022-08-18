import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Wallet } from './Wallet';
import { Iframe } from './Iframe';
import { RedirectPopup } from './RedirectPopup';
import { ConfirmPopup } from './ConfirmPopup';
import { TransactionPopup } from './TransactionPopup';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wallet />} />
        <Route path="/popup" element={<Iframe />} />
        <Route path="/redirect" element={<RedirectPopup />} />
        <Route path="/confirm" element={<ConfirmPopup />} />
        <Route path="/transaction" element={<TransactionPopup />} />
      </Routes>
    </BrowserRouter>
  );
};
