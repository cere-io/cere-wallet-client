import { observer } from 'mobx-react-lite';
import { Stack, Typography, styled, AmountInput, LoadingButton } from '@cere-wallet/ui';
import { Button, FormControl, TextField } from '@cere/ui';
import * as yup from 'yup';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAssetStore, useNetworkStore } from '~/hooks';
import { useCallback, useEffect, useState } from 'react';

import { Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '~/hooks/useTransactionStore';
import { BigNumber } from 'bignumber.js';

import { AssetSelect } from '../AssetSelect';

const Summary = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.neutral.light,
  borderRadius: 16,
}));

const validationSchema = yup
  .object({
    asset: yup.string().required('Asset is required field'),
    address: yup
      .string()
      .required('Address is required field')
      .matches(/^0x[a-fA-F0-9]{40}$/g, 'Should be ethereum address format'),
    amount: yup
      .string()
      .required('Amount is required field')
      .matches(/^\d*\.?\d*$/, 'Should be a number'),
  })
  .required();

const TransferAsset = () => {
  const navigate = useNavigate();

  const { list } = useAssetStore();
  const network = useNetworkStore();
  const { transferErc20 } = useTransactionStore();
  const [total, setTotal] = useState<string>('0');

  const {
    control,
    register,
    handleSubmit,
    setError,
    getValues: getFormValues,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: {
      asset: list[0].ticker,
      address: '0x9317382d69804b22f2b5d1779ecbf62c8c11aa67',
      amount: '0',
    },
  });

  const { asset: ticker, amount: amountValue } = watch();
  const selectedAsset = list.find((asset) => asset.ticker === ticker);

  const updateTotal = useCallback(() => {
    if (!+amountValue || !selectedAsset) {
      setTotal(`${network?.fee} ${network?.network?.ticker}`);
      return;
    }

    const tax = new BigNumber(network?.fee);
    const amount = new BigNumber(getFormValues('amount'));
    if (network.network?.ticker === selectedAsset?.ticker) {
      const total = tax.plus(amount);
      setTotal(`${total.toString()} ${network.network?.ticker}`);
    } else {
      setTotal(`${amount.toString()} ${selectedAsset?.ticker} + ${network.fee} ${network.network?.ticker}`);
    }
  }, [selectedAsset, amountValue, network, getFormValues]);

  const amountValidate = (): boolean => {
    const value: string = getFormValues('amount');

    if (selectedAsset) {
      const maxBalance = new BigNumber(selectedAsset?.balance || '0');
      const amount = new BigNumber(value);
      if (amount.gt(maxBalance)) {
        setError('amount', {
          message: `this field cannot be greater than balance (${selectedAsset?.ticker} balance is ${
            selectedAsset?.balance || 0
          })`,
        });
        return false;
      }
    }

    updateTotal();

    return true;
  };

  const navigateBackHandler = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSubmit: SubmitHandler<any> = async ({ asset, address, amount }) => {
    if (asset && address && amount && amountValidate()) {
      await transferErc20(asset, address, amount);
    }
  };

  useEffect(() => {
    updateTotal();
  }, [selectedAsset, updateTotal]);

  return (
    <Stack
      direction="column"
      spacing={2}
      alignItems="stretch"
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack>
        <Typography variant="body2">Select asset</Typography>
        <Controller name="asset" control={control} render={({ field }) => <AssetSelect assets={list} {...field} />} />
      </Stack>
      <Stack>
        <Typography variant="body2">Transfer To</Typography>

        <TextField
          {...register('address')}
          error={!!errors?.address?.message}
          helperText={errors.address?.message}
          placeholder="Recipient’s ETH address"
        />
      </Stack>
      <Stack>
        <Typography variant="body2">Amount</Typography>
        <FormControl>
          <AmountInput
            {...register('amount')}
            required
            maxValue={selectedAsset?.balance?.toString()}
            error={!!errors?.amount?.message}
            helperText={errors.amount?.message}
            onKeyUp={amountValidate}
          />

          {selectedAsset && (
            <Typography variant="body2" color="text.secondary">
              Available balance: {selectedAsset?.balance} {selectedAsset?.ticker}
            </Typography>
          )}
        </FormControl>
      </Stack>
      <Summary spacing={2} alignItems="stretch" padding={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" color="text.secondary" fontWeight="regular">
            Network fee
          </Typography>
          <Typography variant="subtitle1">
            {network.fee?.toString()} {network.network?.ticker}
          </Typography>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" color="text.secondary" fontWeight="regular">
            Total cost
          </Typography>
          <Typography variant="subtitle1">{total}</Typography>
        </Stack>
      </Summary>
      <Stack direction="row" spacing={2}>
        <Button fullWidth variant="outlined" onClick={() => navigateBackHandler()}>
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
