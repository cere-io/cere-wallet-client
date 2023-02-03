import { FC, useEffect } from 'react';

import { Box, Divider, Stack, Button, IconButton, TextField, styled, Typography, ArrowLeftIcon } from '@cere-wallet/ui';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useAssetStore, useDebounce } from '~/hooks';
import { NETWORKS_LIST } from '~/stores';
import { SelectNetwork } from './SelectNetwork';
import { isValidAddress } from '@cere-wallet/wallet-engine';

const [, POLYGON] = NETWORKS_LIST;

interface AddCustomAssetProps {
  onClose: VoidFunction;
  changeStep: VoidFunction;
}

const validationSchema = yup.object({
  network: yup.string(),
  address: yup
    .string()
    .required('Address is required field')
    .test(
      'isValidAddress',
      'Should be ethereum address format',
      (value) => !!value && isValidAddress(value, 'ethereum'),
    ),
  ticker: yup.string().required('Symbol is required field'),
  displayName: yup.string().required('Name is required field'),
  decimals: yup.number().required('Decimals is required field'),
});

const Label = styled(Typography)(() => ({
  margin: 0,
}));

const FormItem = styled(Box)(() => ({
  width: '100%',
}));

const Field = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    height: 48,
  },
}));

export const AddCustomAsset: FC<AddCustomAssetProps> = ({ onClose, changeStep }) => {
  const assetStore = useAssetStore();

  const {
    register,
    formState: { errors, isValid },
    handleSubmit: onSubmit,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onTouched',
    defaultValues: {
      address: '',
      ticker: '',
      displayName: '',
      network: POLYGON.value,
      decimals: 0,
    },
  });

  const watchAddress = watch('address');
  const debouncedAddress = useDebounce(watchAddress, 500);

  useEffect(() => {
    (async () => {
      if (debouncedAddress) {
        const erc20 = assetStore.getERC20Contract(debouncedAddress);

        if (erc20) {
          const name = await erc20.name();
          const ticker = await erc20.symbol();
          const decimals = await erc20.decimals();
          setValue('displayName', name);
          setValue('ticker', ticker);
          setValue('decimals', decimals);
        }
      }
    })();
  }, [debouncedAddress, setValue, assetStore]);

  const handleSubmit = onSubmit((formValues) => {
    assetStore.addAsset({ id: '', ...formValues });
    changeStep();
    onClose();
  });

  return (
    <Box>
      <Stack alignItems="center" marginBottom={3}>
        <Stack sx={{ width: '100%' }} direction="row" alignItems="center" justifyContent="start" gap={1}>
          <IconButton onClick={changeStep}>
            <ArrowLeftIcon />
          </IconButton>
          <Typography variant="h4">Add custom asset</Typography>
        </Stack>
        <Stack spacing={2} sx={{ width: '100%' }} alignItems="center" marginTop={3} marginBottom={6}>
          <SelectNetwork size="small" showIcon onChange={register('network').onChange} />

          <FormItem>
            <Label variant="body2">Token contract address</Label>
            <Field
              fullWidth
              size="small"
              {...register('address')}
              error={Boolean(errors.address?.message)}
              helperText={errors.address?.message}
            />
          </FormItem>
          <FormItem>
            <Label variant="body2">Token symbol</Label>
            <Field
              fullWidth
              size="small"
              {...register('ticker')}
              error={Boolean(errors.ticker?.message)}
              helperText={errors.ticker?.message}
            />
          </FormItem>
          <FormItem>
            <Label variant="body2">Token name</Label>
            <Field
              fullWidth
              size="small"
              {...register('displayName')}
              error={Boolean(errors.displayName?.message)}
              helperText={errors.displayName?.message}
            />
          </FormItem>
          <FormItem>
            <Label variant="body2">Decimals of precision</Label>
            <Field
              fullWidth
              size="small"
              {...register('decimals')}
              error={Boolean(errors.decimals?.message)}
              helperText={errors.decimals?.message}
            />
          </FormItem>
        </Stack>
      </Stack>
      <Stack
        divider={<Divider />}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        marginBottom={3}
        gap={1}
      >
        <Button fullWidth type="button" onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button fullWidth disabled={!isValid} onClick={handleSubmit} variant="contained">
          Add
        </Button>
      </Stack>
    </Box>
  );
};
