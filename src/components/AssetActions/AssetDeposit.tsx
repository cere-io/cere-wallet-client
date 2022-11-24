import { ReactElement } from 'react';
import {
  Address,
  Button,
  CereIcon,
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
  logo?: ReactElement;
};

export const AssetDeposit = ({ name, logo, address, ...props }: AssetPurchaseProps) => {
  const { startPayment } = useRamp({ address });

  return (
    <Paper variant="outlined">
      <Stack {...props}>
        <Typography variant="h4">Purchase Cryptocurrency via {name}</Typography>
        <Typography variant="subtitle1">Your address for receiving funds</Typography>
        <Address variant="outlined" address={address} showCopy={true} />
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
