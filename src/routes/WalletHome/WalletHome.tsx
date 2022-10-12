import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';

import { AccountBalanceWidget, ActivityList, AssetList, OnboardingDialog } from '~/components';

const WalletHome = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<'assets' | 'activity'>('assets');

  const showOnboarding = location.hash.slice(1) === 'onboarding';

  return (
    <Stack spacing={4}>
      <AccountBalanceWidget title="Account overview" dense={isMobile} />

      <Stack spacing={3}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size={isMobile ? 'small' : 'medium'}
          value={currentTab}
          onChange={(event, value) => value && setCurrentTab(value)}
          color="primary"
          sx={{
            maxWidth: 430,
            alignSelf: 'center',
          }}
        >
          <ToggleButton value="assets">Assets</ToggleButton>
          <ToggleButton value="activity">Activity</ToggleButton>
        </ToggleButtonGroup>

        {currentTab === 'assets' ? <AssetList dense={isMobile} /> : <ActivityList dense={isMobile} />}
      </Stack>

      <OnboardingDialog open={showOnboarding} onClose={() => navigate({ ...location, hash: '' })} />
    </Stack>
  );
};

export default observer(WalletHome);
