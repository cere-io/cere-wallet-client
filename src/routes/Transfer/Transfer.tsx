import { useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Stack, ToggleButton, ToggleButtonGroup, useIsMobile } from '@cere-wallet/ui';
import { PageHeader, TransferFaq } from '~/components';

enum Tabs {
  ASSET = 'asset',
  COLLECTIBLE = 'collectible',
}

const Transfer = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveFromLocation = useCallback(() => {
    const tab = location.pathname.split('/')?.pop();
    return tab === Tabs.COLLECTIBLE ? Tabs.COLLECTIBLE : Tabs.ASSET;
  }, [location.pathname]);

  return (
    <>
      <PageHeader title="Transfer details" backUrl=".." />

      <Stack alignItems="stretch" spacing={2}>
        <Stack display="grid" gridTemplateColumns="repeat(9, 1fr)" rowGap={4} columnGap={4}>
          <Stack gridColumn={isMobile ? '1/10' : '1/6'} spacing={2}>
            <ToggleButtonGroup
              className="wallet-transfer-action"
              exclusive
              fullWidth
              color="primary"
              size={isMobile ? 'small' : 'medium'}
              value={getActiveFromLocation()}
              onChange={(event, value) => {
                value && navigate({ ...location, pathname: `${value}` });
              }}
            >
              <ToggleButton value={Tabs.ASSET}>Assets</ToggleButton>
              <ToggleButton value={Tabs.COLLECTIBLE}>Collectibles</ToggleButton>
            </ToggleButtonGroup>

            <Outlet />
          </Stack>
          <Stack gridColumn={isMobile ? '1/10' : '6/10'} spacing={3}>
            <TransferFaq />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default observer(Transfer);
