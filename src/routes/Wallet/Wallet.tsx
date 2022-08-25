import { InfoTable, Card, CardContent, CardHeader, Stack } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { WalletLayout } from '~/components';
import { WalletStore } from '~/stores';

const Wallet = () => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId') || undefined;
  const store = useMemo(() => new WalletStore(instanceId), [instanceId]);

  const account = store.accountStore.account;
  const assets = store.accountStore.assets;
  const network = store.networkStore.network;

  useEffect(() => {
    store.init();
  }, [store]);

  return (
    <WalletLayout>
      <Stack spacing={4} marginTop={10}>
        <Card variant="outlined">
          <CardHeader title="Account" />
          <CardContent>
            <InfoTable dense>
              <InfoTable.Row label="Email" value={account?.userInfo.email} />
              <InfoTable.Row label="Name" value={account?.userInfo.name} />
              <InfoTable.Row label="Address" value={account?.address} />
            </InfoTable>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Network" />
          <CardContent>
            <InfoTable dense>
              <InfoTable.Row label="Network" value={network?.displayName} />
              <InfoTable.Row label="Chain ID" value={network?.chainId && parseInt(network?.chainId, 16)} />
              <InfoTable.Row label="Currency" value={network?.tickerName} />
            </InfoTable>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Assets" />
          <CardContent>
            <InfoTable dense>
              {assets.list.map((asset) => (
                <InfoTable.Row key={asset.ticker} label={asset.displayName} value={asset.balance} />
              ))}
            </InfoTable>
          </CardContent>
        </Card>
      </Stack>
    </WalletLayout>
  );
};

export default observer(Wallet);
