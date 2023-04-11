import { Route, Routes } from 'react-router-dom';

import { EmbeddedWallet } from './EmbeddedWallet';

export const EmbedWalletRouter = () => (
  <Routes>
    <Route index Component={EmbeddedWallet} />
  </Routes>
);
