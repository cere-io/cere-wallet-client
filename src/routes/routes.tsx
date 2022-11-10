import { Route, Navigate, useLocation, createRoutesFromElements, To, resolvePath } from 'react-router-dom';
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
import { IntroRoute, LoginRoute, OtpRoute, AuthorizeClose, AuthorizeRedirect } from './Authorize';

const walletMenu: WalletProps['menu'] = [
  { label: 'Account overview', icon: <MonetizationOnIcon />, path: '/wallet/home' },
  { label: 'Collectibles', icon: <AppsIcon />, path: '/wallet/collectibles', comingSoon: true },
  { label: 'Settings', icon: <SettingsIcon />, path: '/wallet/settings' },
];

const Redirect = ({ to }: { to: To }) => {
  const location = useLocation();
  const { pathname, hash } = resolvePath(to, location.pathname);

  return <Navigate replace to={{ ...location, pathname, hash }} />;
};

export default createRoutesFromElements(
  <Route path="/">
    <Route index element={<Redirect to="wallet/home" />} />
    <Route path="redirect" element={<RedirectPopup />} />
    <Route path="confirm" element={<ConfirmPopup />} />
    <Route path="transaction" element={<TransactionPopup />} />

    <Route path="popup/*" element={<EmbeddedWallet />} />

    <Route path="wallet" element={<Wallet menu={walletMenu} />}>
      <Route index element={<Redirect to="home" />} />

      <Route path="home">
        <Route index element={<WalletHome />} />
        <Route path="topup" element={<TopUp />} />
      </Route>

      <Route path="collectibles" element={<Collectibles />} />
      <Route path="settings" element={<Settings />} />
    </Route>

    <Route path="wallet/topup" element={<Redirect to={{ pathname: '../home', hash: 'onboarding' }} />} />

    <Route path="authorize">
      <Route index element={<IntroRoute />} />
      <Route path="close" element={<AuthorizeClose />} />
      <Route path="redirect" element={<AuthorizeRedirect />} />
      <Route path="intro" element={<IntroRoute />} />
      <Route path="signin" element={<LoginRoute variant="signin" />} />
      <Route path="signup" element={<LoginRoute variant="signup" />} />
      <Route path="otp" element={<OtpRoute />} />
    </Route>
  </Route>,
);
