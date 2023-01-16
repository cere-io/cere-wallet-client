import { Button, CancelIcon, CheckCircleIcon, Stack, TransactionProgressIcon, Typography } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { TransactionPopupStore } from '~/stores';

export type TransactionResultProps = {
  store: TransactionPopupStore;
};

const headers = {
  confirmed: 'Your transfer is complete successfully',
  pending: 'Your transaction is being processed',
  rejected: 'Transaction error',
};

const descriptions = {
  confirmed: 'Your transaction completed',
  pending: 'Your transaction will be completed in approximately 30 seconds',
  rejected: 'Your transaction is not completed. Please try again',
};

const icons = {
  confirmed: <CheckCircleIcon color="success" sx={{ fontSize: 100 }} />,
  pending: <TransactionProgressIcon sx={{ fontSize: 200 }} />,
  rejected: <CancelIcon color="error" sx={{ fontSize: 100 }} />,
};

const TransactionComplete = ({ store }: TransactionResultProps) => {
  const transaction = store.transaction;

  if (!transaction) {
    return null;
  }

  return (
    <>
      <Stack spacing={1} alignItems="center" marginBottom={4}>
        <Stack justifyContent="center" alignItems="center" height={200}>
          {icons[transaction.status]}
        </Stack>

        <Typography align="center" variant="h3">
          {headers[transaction.status]}
        </Typography>
        <Typography align="center" variant="body1" color="text.secondary">
          {descriptions[transaction.status]}
        </Typography>
      </Stack>
      <Button variant="contained" fullWidth onClick={() => store.done()}>
        Continue
      </Button>
    </>
  );
};

export default observer(TransactionComplete);
