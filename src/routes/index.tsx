import {
  RouterProvider,
  createBrowserRouter,
  Route,
  Navigate,
  useLocation,
  createRoutesFromElements,
} from 'react-router-dom';
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
import { TopUp } from './TopUp';
import { Login } from './Login';

const walletMenu: WalletProps['menu'] = [
  { label: 'Account overview', icon: <MonetizationOnIcon />, path: '/wallet/home' },
  { label: 'Collectibles', icon: <AppsIcon />, path: '/wallet/collectibles', comingSoon: true },
  { label: 'Settings', icon: <SettingsIcon />, path: '/wallet/settings' },
];

const Redirect = ({ to }: { to: string }) => {
  const location = useLocation();

  return <Navigate replace to={{ ...location, pathname: to }} />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Redirect to="wallet/home" />} />
      <Route path="login" element={<Login />} />
      <Route path="popup" element={<EmbeddedWallet />} />
      <Route path="redirect" element={<RedirectPopup />} />
      <Route path="confirm" element={<ConfirmPopup />} />
      <Route path="transaction" element={<TransactionPopup />} />

      <Route path="wallet" element={<Wallet menu={walletMenu} />}>
        <Route index element={<Redirect to="home" />} />

        <Route path="home">
          <Route index element={<WalletHome />} />
          <Route path="topup" element={<TopUp />} />
        </Route>

        <Route path="collectibles" element={<Collectibles />} />
        <Route path="settings" element={<Settings />} />
        <Route path="topup" element={<Redirect to="wallet/home" />} />
      </Route>
    </Route>,
  ),
);

export const Router = () => <RouterProvider router={router} />;
