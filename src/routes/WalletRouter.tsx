import { Route, Routes } from 'react-router-dom';
import { MonetizationOnIcon, SettingsIcon } from '@cere-wallet/ui';

import { Wallet, WalletProps } from './Wallet';
import { WalletHome } from './WalletHome';
import { Redirect } from './Redirect';
import { TopUp } from './TopUp';
import { AssetBuy, AssetReceive, Assets } from './Assets';
import { Transfer } from './Transfer';
import TransferAsset from '~/components/Transfer/TransferAsset';
import TransferCollectibles from './Transfer/TransferCollectibles';
import { CollectibleItem } from './Collectibles/CollectibleItem';
import { Collectibles } from './Collectibles';
import { Activity } from './Activity';
import { Settings } from './Settings';

const walletMenu: WalletProps['menu'] = [
  { label: 'Account overview', icon: <MonetizationOnIcon />, path: '/wallet/home' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/wallet/settings' },
];

export const WalletRouter = () => (
  <Routes>
    <Route path="topup" element={<Redirect to={{ pathname: '../home', hash: 'onboarding' }} />} />

    <Route element={<Wallet menu={walletMenu} />}>
      <Route index element={<Redirect to="home" />} />

      <Route path="home/topup" element={<TopUp />}>
        <Route index element={<AssetBuy />} />
        <Route path="buy" element={<AssetBuy />} />
        <Route path="receive" element={<AssetReceive />} />
      </Route>

      <Route path="home/transfer" element={<Transfer />}>
        <Route index element={<TransferAsset />} />
        <Route path="asset" element={<TransferAsset />} />
        <Route path="collectible" element={<TransferCollectibles />} />
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
  </Routes>
);
