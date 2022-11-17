import { Stack, Typography, Radio, Chip, StackProps } from '@cere-wallet/ui';
import { ReactElement } from 'react';

export type AssetPurchaseProviderProps = StackProps & {
  name: string;
  logo: ReactElement;
  smallLogo: ReactElement;
  payMethodList: string[];
  fees: string;
  limits: string;
  assetList: string[];
  checked?: boolean;
};

export const AssetDepositProvider = ({
  logo,
  payMethodList,
  fees,
  limits,
  assetList,
  checked,
  ...props
}: Omit<AssetPurchaseProviderProps, 'smallLogo'>) => {
  return (
    <Stack {...props}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {logo}
        <Radio size="medium" checked={checked} sx={{ padding: 0 }} />
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Pay with
        </Typography>
        <Typography variant="body2">{payMethodList.join(' ')}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Fees
        </Typography>
        <Typography variant="body2">{fees}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Limits
        </Typography>
        <Typography variant="body2">{limits}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          Currencies
        </Typography>
        <Stack direction="row" spacing={1}>
          {assetList.map((asset, i) => (
            <Chip key={i} size="small" label={asset} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
