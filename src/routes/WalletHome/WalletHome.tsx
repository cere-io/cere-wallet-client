import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';

import { AccountBalanceWidget, ActivityList, AssetList } from '~/components';

const WalletHome = () => {
  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState<'assets' | 'activity'>('assets');

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
    </Stack>
  );
};

export default observer(WalletHome);
