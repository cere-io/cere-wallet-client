import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {
  NoActivityIcon,
  NoCoinsIcon,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useIsMobile,
} from '@cere-wallet/ui';

import { AccountBalanceWidget } from '~/components';

const WalletHome = () => {
  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState<'coins' | 'activity'>('coins');

  return (
    <Stack spacing={4}>
      <AccountBalanceWidget title="Coins" dense={isMobile} />

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
          <ToggleButton value="coins">Coins</ToggleButton>
          <ToggleButton value="activity">Activity</ToggleButton>
        </ToggleButtonGroup>

        {/**
         * TODO: Replace the component below with real implementation
         */}
        <Paper
          variant="outlined"
          sx={{
            height: 400,
            borderRadius: 4,
            display: 'flex',
            paddingTop: 10,
            paddingX: 8,
            justifyContent: 'center',
          }}
        >
          <Stack spacing={1} alignItems="center">
            {currentTab === 'coins' ? (
              <>
                <NoCoinsIcon sx={{ fontSize: '120px' }} />
                <Typography align="center" fontWeight="bold">
                  Coins not found
                </Typography>
                <Typography align="center" variant="body2" color="text.secondary">
                  Add coins to your overview to see the balance and activity
                </Typography>
              </>
            ) : (
              <>
                <NoActivityIcon sx={{ fontSize: '120px' }} />
                <Typography align="center" fontWeight="bold">
                  You have no transactions yet
                </Typography>
                <Typography align="center" variant="body2" color="text.secondary">
                  Use your wallet in transactions and they will automatically show here
                </Typography>
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
};

export default observer(WalletHome);
