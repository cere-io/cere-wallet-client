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
import { BigNumber } from 'bignumber.js';

const ContentSelect = styled(TextField)(() => ({
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
    setError,
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

  const updateTotal = useCallback(() => {
    const amountValue = getFormValues('amount');
    if (!amountValue || !selectedAsset) {
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
  }, [selectedAsset, network, getFormValues]);

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
      await transferErc20(asset, address, amount); // TODO integrate transaction page here
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
            onKeyUp={amountValidate}
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
        <Button variant="contained" type="submit" fullWidth={true}>
          Transfer
        </Button>
      </Stack>
    </Stack>
  );
};

export default observer(TransferAsset);
