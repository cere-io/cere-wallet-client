import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Wallet } from './Wallet';

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wallet />} />
      </Routes>
    </BrowserRouter>
  );
};
