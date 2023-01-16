import { Button, Stack, TransactionProgressIcon, Typography } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { TransactionPopupStore } from '~/stores';

export type TransactionResultProps = {
  store: TransactionPopupStore;
};

const TransactionComplete = ({ store }: TransactionResultProps) => (
  <>
    <Stack spacing={1} alignItems="center" marginBottom={4}>
      <TransactionProgressIcon sx={{ fontSize: 200 }} />
      <Typography align="center" variant="h3">
        Your transaction is being processed
      </Typography>
      <Typography align="center" variant="body1" color="text.secondary">
        Your transaction will be completed in less than 30 seconds
      </Typography>
    </Stack>
    <Button variant="contained" fullWidth onClick={() => store.done()}>
      Continue
    </Button>
  </>
);

export default observer(TransactionComplete);
