import { FC } from 'react';
import { Box, Divider, Stack, Button, IconButton, TextField, styled, Typography, ArrowLeftIcon } from '@cere-wallet/ui';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useAssetStore } from '~/hooks';
import { ETH_ID, NETWORKS_LIST } from '~/stores';
import { SelectNetwork } from './SelectNetwork';

const [ETHEREUM] = NETWORKS_LIST;

interface AddCustomAssetProps {
  onClose: VoidFunction;
  changeStep: VoidFunction;
}

const validationSchema = yup.object({
  id: yup.string(),
  network: yup.string(),
  address: yup.string().required('Address required'),
  ticker: yup.string().required('Symbol required'),
  displayName: yup.string().required('Display Name required'),
  decimals: yup.number().required('Decimals required').integer(),
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
  const {
    register,
    handleSubmit: onSubmit,
    getValues,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onSubmit',
    defaultValues: {
      id: ETH_ID,
      address: '',
      ticker: '',
      displayName: '',
      network: ETHEREUM.value,
      decimals: 0,
    },
  });

  console.log('-->', getValues());
  const assetStore = useAssetStore();

  const handleSubmit = () => {
    onSubmit((formValues) => {
      assetStore.addAsset(formValues);
      changeStep();
      onClose();
    });
  };

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
          <SelectNetwork size="small" showIcon {...register('network')} />

          <FormItem>
            <Label variant="body2">Token contract address</Label>
            <Field fullWidth size="small" {...register('address')} />
          </FormItem>
          <FormItem>
            <Label variant="body2">Token symbol</Label>
            <Field fullWidth size="small" {...register('ticker')} />
          </FormItem>
          <FormItem>
            <Label variant="body2">Token name</Label>
            <Field fullWidth size="small" {...register('displayName')} />
          </FormItem>
          <FormItem>
            <Label variant="body2">Decimals of precision</Label>
            <Field fullWidth size="small" {...register('decimals')} />
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
