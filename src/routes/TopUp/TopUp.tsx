import { useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // TODO add useNavigate
import { observer } from 'mobx-react-lite';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';
import { PageHeader } from '~/components';

enum Tabs {
  BUY = 'buy',
  RECEIVE = 'receive',
}

const TopUp = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  // const navigate = useNavigate();

  const getActiveFromLocation = useCallback(() => {
    const tab = location.pathname.split('/')?.pop();
    return tab === 'receive' ? Tabs.RECEIVE : Tabs.BUY;
  }, [location.pathname]);

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
        // onChange={(event, value) => {
        //   value && navigate({ ...location, pathname: `${value}` });
        // }} // TODO uncomment after payment fix (also line 41)
        sx={{
          maxWidth: 430,
          alignSelf: 'center',
        }}
      >
        {/*<ToggleButton value="buy">Buy asset</ToggleButton>*/}
        <ToggleButton value={Tabs.RECEIVE}>Receive asset</ToggleButton>
      </ToggleButtonGroup>

      <Outlet />
    </Stack>
  );
};

export default observer(TopUp);
