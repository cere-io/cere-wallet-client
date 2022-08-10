import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Wallet } from './Wallet';
import { Iframe } from './Iframe';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wallet />} />
        <Route path="/popup" element={<Iframe />} />
      </Routes>
    </BrowserRouter>
  );
};
