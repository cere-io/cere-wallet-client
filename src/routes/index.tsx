import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppsIcon, MonetizationOnIcon, SettingsIcon } from '@cere-wallet/ui';
import { AuthScreen } from '@cere-wallet/authentication';

import { EmbeddedWallet } from './EmbeddedWallet';
import { RedirectPopup } from './RedirectPopup';
import { ConfirmPopup } from './ConfirmPopup';
import { TransactionPopup } from './TransactionPopup';

// Full-page wallet routes
import { Wallet, WalletProps } from './Wallet';
import { WalletHome } from './WalletHome';
import { Collectables } from './Collectables';
import { Settings } from './Settings';
import { Login } from './Login';

const walletMenu: WalletProps['menu'] = [
  { label: 'Coins', icon: <MonetizationOnIcon />, path: '/wallet/home' },
  { label: 'Collectables', icon: <AppsIcon />, path: '/wallet/collectables' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/wallet/settings' },
];

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/wallet/home" />} />
        <Route path="/popup" element={<EmbeddedWallet />} />
        <Route path="/redirect" element={<RedirectPopup />} />
        <Route path="/confirm" element={<ConfirmPopup />} />
        <Route path="/transaction" element={<TransactionPopup />} />

        <Route path="/login" element={<Login />} />
        <Route path="/login/authorize" element={<AuthScreen />} />

        <Route path="/wallet" element={<Wallet menu={walletMenu} />}>
          <Route path="home" element={<WalletHome />} />
          <Route path="collectables" element={<Collectables />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
