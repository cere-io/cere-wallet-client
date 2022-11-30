import { ReactElement } from 'react';
import {
  Address,
  Button,
  CereIcon,
  CopyButton,
  DotArrowRightIcon,
  IconButton,
  Paper,
  Stack,
  StackProps,
  Typography,
} from '@cere-wallet/ui';
import { useRamp } from '~/hooks';

export type AssetPurchaseProps = StackProps & {
  name: string;
  address: string;
  email?: string;
  logo?: ReactElement;
};

export const AssetDeposit = ({ name, logo, address, email, ...props }: AssetPurchaseProps) => {
  const { startPayment } = useRamp({ address, email });

  return (
    <Paper variant="outlined">
      <Stack {...props}>
        <Typography variant="h4">Purchase Cryptocurrency via {name}</Typography>
        <Typography variant="subtitle1">Your address for receiving funds</Typography>
        <Address
          variant="outlined"
          address={address}
          endAdornment={<CopyButton size="small" value={address} successMessage="Address copied" />}
        />
        <Typography variant="body2" color="text.secondary">
          You will be redirected to the third party page
        </Typography>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <IconButton variant="filled" size="small" disableRipple>
            <CereIcon />
          </IconButton>
          <DotArrowRightIcon />
          <IconButton variant="filled" size="small" disableRipple>
            {logo}
          </IconButton>
        </Stack>
        <Button variant="contained" onClick={() => startPayment()}>
          Proceed with {name}
        </Button>
      </Stack>
    </Paper>
  );
};
