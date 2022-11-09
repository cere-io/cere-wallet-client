import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';

import { AccountBalanceWidget, OnboardingDialog } from '~/components';
import { WalletProductTour } from '~/components/ProductTours';

enum Tabs {
  assets = 'assets',
  activity = 'activity',
  collectibles = 'collectibles',
}

const WalletHome = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveFromLocation = (): Tabs => {
    const tab = location.pathname.split('/')?.pop() || '';
    console.log('TAB', tab);
    return tab in Tabs ? Tabs[tab as keyof typeof Tabs] : Tabs.assets;
  };

  const [currentTab, setCurrentTab] = useState<Tabs>(getActiveFromLocation());
  const showOnboarding = location.hash.slice(1) === 'onboarding';
  const showProductTour = location.hash.slice(1) === 'product-tour';

  useEffect(() => {
    navigate({ ...location, pathname: `${currentTab}` });
  }, [currentTab, location, navigate]);

  return (
    <Stack spacing={4}>
      <AccountBalanceWidget title="Account overview" dense={isMobile} />

      <Stack spacing={3}>
        <ToggleButtonGroup
          className="wallet-assets"
          exclusive
          fullWidth
          color="primary"
          size={isMobile ? 'small' : 'medium'}
          value={currentTab}
          onChange={(event, value) => value && setCurrentTab(value)}
          sx={{
            maxWidth: 430,
            alignSelf: 'center',
          }}
        >
          <ToggleButton value={Tabs.assets}>Assets</ToggleButton>
          <ToggleButton value={Tabs.collectibles}>Collectibles</ToggleButton>
          <ToggleButton value={Tabs.activity}>Activity</ToggleButton>
        </ToggleButtonGroup>

        <Outlet />
      </Stack>

      <OnboardingDialog open={showOnboarding} onClose={() => navigate({ ...location, hash: '' })} />
      {showProductTour && <WalletProductTour onClose={() => navigate({ ...location, hash: '' })} />}
    </Stack>
  );
};

export default observer(WalletHome);
