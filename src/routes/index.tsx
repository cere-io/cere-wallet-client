import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppsIcon, MonetizationOnIcon, SettingsIcon } from '@cere-wallet/ui';

import { EmbeddedWallet } from './EmbeddedWallet';
import { RedirectPopup } from './RedirectPopup';
import { ConfirmPopup } from './ConfirmPopup';
import { TransactionPopup } from './TransactionPopup';

// Full-page wallet routes
import { Wallet, WalletProps } from './Wallet';
import { WalletHome } from './WalletHome';
import { Collectibles } from './Collectibles';
import { Settings } from './Settings';

const walletMenu: WalletProps['menu'] = [
  { label: 'Account overview', icon: <MonetizationOnIcon />, path: '/wallet/home' },
  { label: 'Collectibles', icon: <AppsIcon />, path: '/wallet/collectibles', comingSoon: true },
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

        <Route path="/wallet" element={<Wallet menu={walletMenu} />}>
          <Route path="home" element={<WalletHome />} />
          <Route path="collectibles" element={<Collectibles />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
