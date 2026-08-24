import { Route, Routes } from 'react-router-dom';
import { CategoryIcon, AppsIcon, MonetizationOnIcon, SettingsIcon } from '@cere-wallet/ui';

import { Wallet, WalletProps } from './Wallet';
import { WalletHome } from './WalletHome';
import { Redirect } from './Redirect';
import { TopUp } from './TopUp';
import { AssetReceive, Assets } from './Assets';
import { Transfer } from './Transfer';
import TransferAsset from '~/components/Transfer/TransferAsset';
import TransferCollectibles from './Transfer/TransferCollectibles';
import { CollectibleItem } from './Collectibles/CollectibleItem';
import { Activity } from './Activity';
import { Settings } from './Settings';
import { AgentsPage } from './Agents/AgentsPage';

// Sovereign-data-first nav. Crypto is one tab; data, agents, and identity
// are the daily surface — matches Cere's "Sovereign AI Infrastructure"
// positioning and the Cubby/DDC stack the wallet actually signs for.
const walletMenu: WalletProps['menu'] = [
  { label: 'Home', icon: <CategoryIcon />, path: '/wallet/home' },
  { label: 'Data', icon: <CategoryIcon />, path: '/wallet/data' },
  { label: 'Agents', icon: <AppsIcon />, path: '/wallet/agents' },
  { label: 'Assets', icon: <MonetizationOnIcon />, path: '/wallet/assets' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/wallet/settings' },
];

export const WalletRouter = () => (
  <Routes>
    <Route path="topup" element={<Redirect to={{ pathname: '../home', hash: 'onboarding' }} />} />

    <Route element={<Wallet menu={walletMenu} />}>
      <Route index element={<Redirect to="home" />} />

      <Route path="home/topup" element={<TopUp />}>
        <Route index element={<AssetReceive />} />
      </Route>

      <Route path="home/transfer" element={<Transfer />}>
        <Route index element={<TransferAsset />} />
        <Route path="asset" element={<TransferAsset />} />
        <Route path="collectible" element={<TransferCollectibles />} />
      </Route>

      <Route path="home/collectibles/:nftId" element={<CollectibleItem />} />
      <Route path="home" element={<WalletHome />} />
      <Route path="data" element={<Activity />} />
      <Route path="agents" element={<AgentsPage />} />
      <Route path="assets" element={<Assets />} />

      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
);
