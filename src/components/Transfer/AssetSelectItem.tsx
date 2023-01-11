import { Stack, Typography } from '@cere-wallet/ui';
import { CoinIcon } from '~/components/CoinIcon';

export type MenuItemAssetProps = {
  coin: string;
  name: string;
  network: string;
  balance: number;
};

export const AssetSelectItem = ({ coin, name, network, balance }: MenuItemAssetProps) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" padding={1} sx={{ width: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <CoinIcon coin={coin} sx={{ width: 32, height: 32 }} />
        <Stack>
          <Typography variant="body2" fontWeight="semibold">
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {network}
          </Typography>
        </Stack>
      </Stack>
      <Typography variant="subtitle1" color="text.secondary">
        {balance} {coin.toUpperCase()} &nbsp;
      </Typography>
    </Stack>
  );
};
