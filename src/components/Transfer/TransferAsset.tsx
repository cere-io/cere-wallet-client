import { observer } from 'mobx-react-lite';
import { Stack, Typography, MenuItem, styled, AmountInput } from '@cere-wallet/ui';
import { Button, FormControl, TextField } from '@cere/ui';
import * as yup from 'yup';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AssetSelectItem } from '~/components';
import { useAssetStore, useNetworkStore } from '~/hooks';
import { useCallback, useEffect, useState } from 'react';
import { Asset } from '~/stores';
import { Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '~/hooks/useTransactionStore';
import Big from 'big.js';

const ContentSelect = styled(TextField)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: 0,
  },
  '& .MuiInputBase-root': {
    minHeight: 57,
  },
}));

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
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [total, setTotal] = useState<string>('0');

  const {
    register,
    handleSubmit,
    getValues: getFormValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: {
      asset: undefined,
      address: '0x8F306c4E03032E80933938D9E2EA3a44750F7Ec9',
      amount: '0',
    },
  });

  const updateTotal = (formValue?: string) => {
    const value = formValue || getFormValues('amount');
    console.log('value', value);

    if (!selectedAsset || !value) {
      return;
    }

    let ret = '';
    if (selectedAsset?.ticker === network.network?.ticker) {
      const fee = new Big(network.fee);
      const va = new Big(value);
      ret = `${fee.plus(va).toString()} ${selectedAsset?.ticker}`;
    } else {
      ret = `${network.fee} ${network.network?.ticker}`;
      if (value) {
        ret = `${value} ${selectedAsset?.ticker} + ${ret}`;
      }
    }
    setTotal(ret);
  };

  const onSubmit: SubmitHandler<any> = async () => {
    const value = getFormValues('address');

    console.log('validation OK', value);
  };

  const navigateBackHandler = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const assetTransferHandler = useCallback(async () => {
    const { asset, address, amount } = getFormValues();

    if (typeof selectedAsset?.network !== 'string') {
      throw new Error('network is empty');
    }

    if (asset && address && amount) {
      console.log(asset, address, amount);
      await transferErc20(asset, address, amount);
    }
  }, [getFormValues, transferErc20, selectedAsset]);

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
        <FormControl>
          <ContentSelect
            select
            {...register('asset')}
            error={!!errors?.asset?.message}
            helperText={errors.asset?.message}
            required
            autoFocus
            name="asset"
            onChange={({ target }) => setSelectedAsset(list.find((asset) => asset.ticker === target.value))}
            sx={{ padding: 0 }}
          >
            {list.map((asset, index) => (
              <MenuItem key={`${asset.ticker}-${index}`} value={asset.ticker} sx={{ borderRadius: 0, height: 57 }}>
                <AssetSelectItem
                  coin={asset.ticker}
                  name={asset.displayName}
                  network={asset.network}
                  balance={asset.balance || 0}
                />
              </MenuItem>
            ))}
          </ContentSelect>
        </FormControl>
      </Stack>
      <Stack>
        <Typography variant="body2">Transfer To</Typography>
        <FormControl>
          <TextField
            {...register('address')}
            error={!!errors?.address?.message}
            helperText={errors.address?.message}
            placeholder="Recipient’s ETH address"
            name="address"
            variant="outlined"
          />
        </FormControl>
      </Stack>
      <Stack>
        <Typography variant="body2">Amount</Typography>
        <FormControl>
          <AmountInput
            maxValue={selectedAsset?.balance}
            {...register('amount')}
            error={!!errors?.amount?.message}
            helperText={errors.amount?.message}
            onChange={({ target }) => updateTotal(target.value)}
            required
            name="amount"
            variant="outlined"
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
        <Button variant="outlined" fullWidth={true} onClick={() => navigateBackHandler()}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" fullWidth={true} onClick={() => assetTransferHandler()}>
          Transfer
        </Button>
      </Stack>
    </Stack>
  );
};

export default observer(TransferAsset);
