import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';

import { AccountBalanceWidget, OnboardingDialog } from '~/components';
import { WalletProductTour } from '~/components/ProductTours';
import { OnboardingBanner } from '~/routes/OnboardingBanner';

enum Tabs {
  assets = 'assets',
  activity = 'activity',
  collectibles = 'collectibles',
}

const WalletHome = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const showOnboarding = location.hash.slice(1) === 'onboarding';
  const showProductTour = location.hash.slice(1) === 'product-tour';
  const showOnboardingPopup = location.hash.slice(1) === 'product-tour-popup';

  const getActiveFromLocation = useCallback(() => {
    const tab = location.pathname.split('/')?.pop() || '';
    return tab in Tabs ? Tabs[tab as keyof typeof Tabs] : Tabs.assets;
  }, [location.pathname]);

  useEffect(() => {
    if (localStorage.getItem('showProductTour') !== 'false' && !showProductTour) {
      navigate({ ...location, hash: 'product-tour' });
    }
    if (localStorage.getItem('showOnboardingPopup') === 'false' && !showProductTour) {
      navigate({ ...location, hash: 'product-tour-popup' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          value={getActiveFromLocation()}
          onChange={(event, value) => value && navigate({ ...location, pathname: `${value}` })}
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
      {showOnboardingPopup && ''}
      <OnboardingBanner onClose={() => navigate({ ...location, hash: '' })} />
    </Stack>
  );
};

export default observer(WalletHome);
