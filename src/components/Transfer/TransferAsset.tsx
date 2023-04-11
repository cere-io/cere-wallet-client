import { useEffect } from 'react';
import { observer, useObserver } from 'mobx-react-lite';
import { Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography, AmountInput, LoadingButton, Button, TextField, Alert } from '@cere-wallet/ui';

import { useAssetStore } from '~/hooks';
import { AssetSelect } from '../AssetSelect';
import { useTransferForm } from './useTransferForm';

const TransferAsset = () => {
  const navigate = useNavigate();
  const store = useAssetStore();
  const assets = store.transferable;

  const {
    control,
    register,
    handleSubmit,
    resetField,
    watch,
    formState: { errors, isSubmitting },
  } = useTransferForm({ assets });

  const ticker = watch('asset');
  const selectedAsset = ticker ? store.getAsset(ticker) : undefined;

  useEffect(() => {
    resetField('amount');
  }, [resetField, ticker]);

  return (
    <Stack
      direction="column"
      spacing={2}
      alignItems="stretch"
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(async ({ asset, address, amount }) => {
        try {
          await store.transfer(asset, address, amount);

          resetField('amount');
        } catch (error) {
          console.warn(error);
        }
      })}
    >
      {!!selectedAsset && (
        <Stack>
          <Typography variant="body2">Select asset</Typography>
          <Controller
            name="asset"
            control={control}
            render={({ field }) => <AssetSelect assets={assets} {...field} />}
          />
        </Stack>
      )}

      <Stack>
        <Typography variant="body2">Transfer To</Typography>

        <TextField
          {...register('address')}
          required
          error={!!errors.address?.message}
          helperText={errors.address?.message}
          placeholder="Recipient’s address"
        />
      </Stack>

      <Stack>
        <Typography variant="body2">Amount</Typography>

        <AmountInput
          {...register('amount')}
          required
          placeholder="0"
          maxValue={selectedAsset?.balance?.toString()}
          error={!!errors.amount?.message}
          helperText={
            errors.amount?.message ||
            (selectedAsset && `Available balance: ${selectedAsset.balance} ${selectedAsset.displayName}`)
          }
        />
      </Stack>

      {isSubmitting && <Alert severity="info">Your transfer transaction is being processed</Alert>}

      <Stack direction="row" spacing={2} paddingTop={2}>
        <Button fullWidth disabled={isSubmitting} variant="outlined" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <LoadingButton fullWidth loading={isSubmitting} variant="contained" type="submit">
          Transfer
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default observer(TransferAsset);
