import { Stack, useIsMobile, Link } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { PageHeader, FAQ } from '~/components';
import { ToggleButton, ToggleButtonGroup } from '@cere/ui';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

enum Tabs {
  BUY = 'buy',
  RECEIVE = 'receive',
}

const TopUp = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveFromLocation = useCallback(() => {
    const tab = location.pathname.split('/')?.pop();
    return tab === 'receive' ? Tabs.RECEIVE : Tabs.BUY;
  }, [location.pathname]);

  const polygonLink = (
    <Link target="_blank" href="https://polygon.technology/">
      Polygon network
    </Link>
  );

  const bridgeLink = (
    <Link target="_blank" href="https://wallet.polygon.technology/bridge/">
      Polygon bridge
    </Link>
  );

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
        onChange={(event, value) => {
          console.log('value', value, event);
          value && navigate({ ...location, pathname: `${value}` });
        }}
        sx={{
          maxWidth: 430,
          alignSelf: 'center',
        }}
      >
        <ToggleButton value="buy">Buy asset</ToggleButton>
        <ToggleButton value={Tabs.RECEIVE}>Receive asset</ToggleButton>
      </ToggleButtonGroup>

      <Stack spacing={3} direction={isMobile ? 'column' : 'row'} alignItems="stretch">
        <Outlet />

        <FAQ sx={{ maxWidth: isMobile ? 'auto' : 384 }} title="FAQ">
          <FAQ.Section title="How to fund my wallet by sending USDC?">
            Fund your wallet with USDC. Send USDC from an exchange or other wallet via {polygonLink} to this wallet
            address.
          </FAQ.Section>

          <FAQ.Section title="What address should I use?">
            Polygon address is an ERC20 address which can be used for any ERC20 network like Polygon network or
            Ethereum.
          </FAQ.Section>

          <FAQ.Section title="How can I buy USDC?">
            Buy USDC on Polygon network directly via an exchange and send the funds to this wallet address. Or buy USDC
            on Ethereum network and use the {bridgeLink} to bridge the funds from Ethereum network to Polygon network.
            After which you can send the funds to this wallet address on Polygon network.
          </FAQ.Section>
        </FAQ>
      </Stack>
    </Stack>
  );
};

export default observer(TopUp);
