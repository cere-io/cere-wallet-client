import { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Paper, Stack, Typography, useIsMobile } from '@cere-wallet/ui';
import { Divider } from '@mui/material';
import {
  ASSET_REFILL_PROVIDER_LIST,
  AssetBuyFaq,
  AssetBuyTopAlert,
  AssetDeposit,
  AssetDepositProvider,
} from '~/components';
import { useAccountStore } from '~/hooks';

const AssetBuy = () => {
  const isMobile = useIsMobile();
  const { account, user } = useAccountStore();
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);

  const selectProviderHandler = useCallback((i: number) => {
    setSelectedProvider(i);
    setTimeout(() => {
      const element = document.getElementById('purchase');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, []);

  if (!account) {
    return <></>;
  }

  return (
    <Stack display="grid" gridTemplateColumns="repeat(9, 1fr)" rowGap={2} columnGap={4}>
      <Stack gridColumn={isMobile ? '1/10' : '1/6'} spacing={1}>
        <AssetBuyTopAlert />
        <Typography fontWeight="bold">Select a Provider</Typography>
        {ASSET_REFILL_PROVIDER_LIST.length && (
          <Paper variant="outlined">
            {ASSET_REFILL_PROVIDER_LIST.map((params, i) => (
              <Stack key={`depositProvider-${i}`}>
                <AssetDepositProvider
                  padding={isMobile ? 2 : 3}
                  name={params.name}
                  logo={params.logo}
                  payMethodList={params.payMethodList}
                  fees={params.fees}
                  limits={params.limits}
                  assetList={params.assetList}
                  spacing={isMobile ? 0.5 : 0.375}
                  checked={i === selectedProvider}
                  onClick={() => selectProviderHandler(i)}
                />
                <Divider />
              </Stack>
            ))}
          </Paper>
        )}
      </Stack>
      <Stack gridColumn={isMobile ? '1/10' : '6/10'} spacing={3}>
        {selectedProvider !== null && (
          <AssetDeposit
            id="purchase"
            address={account.address}
            email={user?.email}
            spacing={2}
            padding={2}
            logo={ASSET_REFILL_PROVIDER_LIST[selectedProvider].smallLogo}
            name={ASSET_REFILL_PROVIDER_LIST[selectedProvider].name}
          />
        )}
        <AssetBuyFaq />
      </Stack>
    </Stack>
  );
};

export default observer(AssetBuy);
