import { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';
import { PageHeader } from '~/components';

enum Tabs {
  BUY = 'buy',
  RECEIVE = 'receive',
  AUTO = 'auto',
}

const TopUp = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveFromLocation = useCallback(() => {
    const tab = location.pathname.split('/')?.pop();
    if (tab === 'receive') return Tabs.RECEIVE;
    if (tab === 'buy') return Tabs.BUY;
    if (tab === 'auto') return Tabs.AUTO;
    return Tabs.BUY; // default to buy with card
  }, [location.pathname]);

  const handleTabChange = (event: React.MouseEvent<HTMLElement>, value: string | null) => {
    if (value) {
      navigate(value);
    }
  };

  return (
    <Stack alignItems="stretch" spacing={2}>
      <PageHeader title="Top Up" backUrl=".." />

      <ToggleButtonGroup
        className="wallet-asset-action"
        exclusive
        fullWidth
        color="primary"
        size={isMobile ? 'small' : 'medium'}
        value={getActiveFromLocation()}
        onChange={handleTabChange}
        sx={{
          maxWidth: 430,
          alignSelf: 'center',
        }}
      >
        <ToggleButton value={Tabs.BUY}>Buy with Card</ToggleButton>
        <ToggleButton value={Tabs.RECEIVE}>Receive asset</ToggleButton>
        <ToggleButton value={Tabs.AUTO}>Auto Top-Up</ToggleButton>
      </ToggleButtonGroup>

      <Outlet />
    </Stack>
  );
};

export default observer(TopUp);
