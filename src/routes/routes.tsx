import { Route, Navigate, useLocation, createRoutesFromElements, To, resolvePath } from 'react-router-dom';
import { MonetizationOnIcon, SettingsIcon } from '@cere-wallet/ui';

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
import { CollectibleItem } from '~/routes/Collectibles/CollectibleItem';
import { AssetBuy, AssetReceive, Assets } from '~/routes/Assets';
import { Activity } from '~/routes/Activity';

const walletMenu: WalletProps['menu'] = [
  { label: 'Account overview', icon: <MonetizationOnIcon />, path: '/wallet/home' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/wallet/settings', comingSoon: true },
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

      <Route path="home/topup" element={<TopUp />}>
        <Route index element={<AssetBuy />} />
        <Route path="buy" element={<AssetBuy />} />
        <Route path="receive" element={<AssetReceive />} />
      </Route>

      <Route path="home/collectibles/:nftId" element={<CollectibleItem />} />

      <Route path="home" element={<WalletHome />}>
        <Route index element={<Assets />} />
        <Route path="assets" element={<Assets />} />
        <Route path="collectibles" element={<Collectibles />} />
        <Route path="activity" element={<Activity />} />
      </Route>

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
