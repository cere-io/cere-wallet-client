import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Wallet } from './Wallet';
import { Iframe } from './Iframe';
import { RedirectPopup } from './RedirectPopup';
import { SignPopup } from './SignPopup';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wallet />} />
        <Route path="/popup" element={<Iframe />} />
        <Route path="/redirect" element={<RedirectPopup />} />
        <Route path="/sign" element={<SignPopup />} />
      </Routes>
    </BrowserRouter>
  );
};
