import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Wallet } from './Wallet';
import { EmbeddedWallet } from './EmbeddedWallet';
import { RedirectPopup } from './RedirectPopup';
import { ConfirmPopup } from './ConfirmPopup';
import { TransactionPopup } from './TransactionPopup';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/wallet/home" />} />
        <Route path="/popup" element={<EmbeddedWallet />} />
        <Route path="/redirect" element={<RedirectPopup />} />
        <Route path="/confirm" element={<ConfirmPopup />} />
        <Route path="/transaction" element={<TransactionPopup />} />

        <Route path="/wallet">
          <Route path="home" element={<Wallet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
