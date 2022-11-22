import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';

import { AccountBalanceWidget, OnboardingDialog } from '~/components';
import { WalletProductTour } from '~/components/ProductTours';
import { OnboardingSnackbar } from '~/routes/OnboardingSnackbar';

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
  const showOnboardingSnackbar = location.hash.slice(1) === 'product-tour-snackbar';

  const getActiveFromLocation = useCallback(() => {
    const tab = location.pathname.split('/')?.pop() || '';
    return tab in Tabs ? Tabs[tab as keyof typeof Tabs] : Tabs.assets;
  }, [location.pathname]);

  const handleCloseSnackbar = useCallback(() => {
    localStorage.setItem('showProductTourSnackbar', 'false');
    navigate({ ...location, hash: '' });
  }, [navigate, location]);

  useEffect(() => {
    if (localStorage.getItem('showProductTour') !== 'false' && !showProductTour) {
      navigate({ ...location, hash: 'product-tour' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      localStorage.getItem('showProductTour') === 'false' &&
      localStorage.getItem('showProductTourSnackbar') !== 'false' &&
      !showProductTour
    ) {
      navigate({ ...location, hash: 'product-tour-snackbar' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProductTour]);

  return (
    <Stack spacing={4}>
      <AccountBalanceWidget title="Account overview" dense={isMobile} />

      <Stack spacing={3}>
        <ToggleButtonGroup
          exclusive
          className="wallet-assets"
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
      <OnboardingSnackbar open={showOnboardingSnackbar} onClose={handleCloseSnackbar} />
    </Stack>
  );
};

export default observer(WalletHome);
