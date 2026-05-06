import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  CopyButton,
  TransferIcon,
  TopUpIcon,
  EastIcon,
  styled,
  useIsMobile,
} from '@cere-wallet/ui';
import { alpha } from '@mui/material';
import { getGlobalStorage } from '@cere-wallet/storage';

import { OnboardingDialog, AddressQRButton, DataActivityList } from '~/components';
import { streamToDataEvents } from '~/components/DataActivityList/sampleEvents';
import { AccountBalance } from '~/components/AccountBalance/AccountBalance';
import { AddressDropdown } from '~/components/AddressDropdown';
import { WalletProductTour } from '~/components/ProductTours';
import { OnboardingSnackbar } from '~/routes/OnboardingSnackbar';
import { useAccountStore, useAssetStore, useScopes, useAgents, useActivity } from '~/hooks';
import { demoScopes, demoAgents, demoActivity } from '~/api/vault-demo';

const HeroCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.background.paper,
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: `radial-gradient(700px 220px at 100% 0%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 60%)`,
  },
}));

const StatTile = styled(Card)(({ theme }) => ({
  height: '100%',
}));

const QuietLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.78rem',
  textDecoration: 'none',
  '&:hover': { color: theme.palette.text.primary },
}));

const WalletHome = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedAccount, user } = useAccountStore();
  const { list: assets } = useAssetStore();
  const scopes = useScopes();
  const agents = useAgents();
  const activity = useActivity();

  const showOnboarding = location.hash.slice(1) === 'onboarding';
  const showProductTour = location.hash.slice(1) === 'product-tour';
  const showOnboardingSnackbar = location.hash.slice(1) === 'product-tour-snackbar';

  const handleCloseSnackbar = useCallback(() => {
    getGlobalStorage().setItem('showProductTourSnackbar', 'false');
    navigate({ ...location, hash: '' });
  }, [navigate, location]);

  useEffect(() => {
    if (getGlobalStorage().getItem('showProductTour') !== 'false' && !showProductTour) {
      navigate({ ...location, hash: 'product-tour' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      getGlobalStorage().getItem('showProductTour') !== 'false' &&
      getGlobalStorage().getItem('showProductTourSnackbar') !== 'false' &&
      !showProductTour
    ) {
      navigate({ ...location, hash: 'product-tour-snackbar' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProductTour]);

  const cereAsset = assets.find((a) => a.ticker === 'CERE');
  const cereDisplay =
    cereAsset?.balance !== undefined ? cereAsset.balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—';

  return (
    <Stack spacing={3}>
      {/* Identity + balance hero */}
      <HeroCard>
        <CardContent sx={{ position: 'relative', zIndex: 1, py: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
            <Stack spacing={1.5} flex={1}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.caption">
                  Total balance · {user?.email || 'Cere wallet'}
                </Typography>
                <AccountBalance variant={isMobile ? 'h2' : 'h1'} />
              </Stack>
              {selectedAccount && (
                <Stack direction="row" spacing={1} alignItems="center" className="wallet-address">
                  <AddressDropdown
                    variant={isMobile ? 'default' : 'outlined'}
                    size="small"
                    maxLength={isMobile ? 16 : 28}
                  />
                  <CopyButton value={selectedAccount.address} variant="outlined" successMessage="Address copied" />
                  <AddressQRButton address={selectedAccount.address} variant="outlined" />
                </Stack>
              )}
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button component={Link} to="transfer" variant="contained" startIcon={<TransferIcon />}>
                Transfer
              </Button>
              <Button
                component={Link}
                to="topup"
                className="wallet-top-up"
                variant="outlined"
                startIcon={<TopUpIcon />}
              >
                Top up
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </HeroCard>

      {/* Stat tiles */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <StatTile sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="caption"
              color="text.caption"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              CERE balance
            </Typography>
            <Typography variant="h2" mt={0.5}>
              {cereDisplay}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cere Network
            </Typography>
          </CardContent>
        </StatTile>
        <StatTile sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="caption"
              color="text.caption"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Cubbies
            </Typography>
            <Typography variant="h2" mt={0.5}>
              {scopes.loading
                ? '…'
                : scopes.notFound
                ? demoScopes.length.toString()
                : scopes.error
                ? '—'
                : (scopes.data?.length ?? 0).toString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scopes.notFound ? 'preview · claim vault' : scopes.error ? 'vault unreachable' : 'across your vault'}
            </Typography>
          </CardContent>
        </StatTile>
        <StatTile sx={{ flex: 1 }}>
          <CardContent>
            <Typography
              variant="caption"
              color="text.caption"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              Active grants
            </Typography>
            <Typography variant="h2" mt={0.5}>
              {agents.loading
                ? '…'
                : agents.notFound
                ? demoAgents.filter((a) => a.status !== 'revoked').length.toString()
                : agents.error
                ? '—'
                : (agents.data || []).filter((a: any) => a.status !== 'revoked' && a.status !== 'expired').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {agents.notFound
                ? 'preview · ' +
                  demoAgents
                    .filter((a) => a.status !== 'revoked')
                    .slice(0, 2)
                    .map((a) => a.agentName)
                    .join(' · ')
                : agents.error
                ? 'vault unreachable'
                : (agents.data || [])
                    .filter((a: any) => a.status !== 'revoked' && a.status !== 'expired')
                    .slice(0, 2)
                    .map((a: any) => a.agentName || a.agentId)
                    .join(' · ') || 'no agents connected'}
            </Typography>
          </CardContent>
        </StatTile>
      </Stack>

      {/* Recent data activity preview */}
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Stack>
              <Typography variant="subtitle1">Recent data activity</Typography>
              <Typography variant="caption" color="text.caption">
                {activity.notFound
                  ? 'preview — claim your vault to see real events'
                  : activity.error
                  ? 'vault unreachable — showing examples'
                  : 'Reads, writes, grants, and revokes on your address'}
              </Typography>
            </Stack>
            <QuietLink to="/wallet/data">
              View all <EastIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} />
            </QuietLink>
          </Stack>
        </CardContent>
        <DataActivityList
          limit={4}
          events={
            activity.notFound
              ? streamToDataEvents(demoActivity)
              : activity.data && activity.data.length > 0
              ? streamToDataEvents(activity.data)
              : activity.error
              ? undefined // sample fallback
              : []
          }
        />
      </Card>

      <OnboardingDialog open={showOnboarding} onClose={() => navigate({ ...location, hash: '' })} />
      {showProductTour && <WalletProductTour onClose={() => navigate({ ...location, hash: '' })} />}
      <OnboardingSnackbar open={showOnboardingSnackbar} onClose={handleCloseSnackbar} />
    </Stack>
  );
};

export default observer(WalletHome);
