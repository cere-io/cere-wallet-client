import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { isValidAddress } from '@cere-wallet/wallet-engine';

import { Asset } from '~/stores';
import { utils } from 'ethers';
import { useEffect } from 'react';

export type UseTransferFormOptions = {
  assets: Asset[];
};

const validationSchema = yup.object({
  asset: yup.string().required('Asset is required field'),
  address: yup
    .string()
    .required('Address is required field')
    .test(
      'isValidAddress',
      'Should be of valid address format',
      (value) => !!value && (isValidAddress(value, 'ed25519') || isValidAddress(value, 'ethereum')), // TODO: Validate address depending on selected asset type
    ),

  amount: yup
    .string()
    .trim()
    .required('Amount is required field')
    .matches(/^\d*\.?\d*$/, 'Should be a number')
    .test('isEnough', (value, { options, parent, createError }) => {
      const assets: Asset[] = options.context?.assets || [];
      const selectedAsset = assets.find((asset) => parent.asset === asset.ticker);

      if (!value || selectedAsset?.balance === undefined) {
        return true;
      }

      const balance = utils.parseUnits(String(selectedAsset.balance || 0), selectedAsset.decimals);
      const amount = utils.parseUnits(value, selectedAsset.decimals);

      return balance.gte(amount)
        ? true
        : createError({
            message: `Not enough tokens to transfer. Available balance is ${selectedAsset.balance} ${selectedAsset.displayName}`,
          });
    }),
});

export const useTransferForm = ({ assets }: UseTransferFormOptions) => {
  const defaultAsset = assets[0]?.ticker || '';
  const form = useForm({
    context: { assets },
    resolver: yupResolver(validationSchema),
    defaultValues: {
      asset: '',
      address: '',
      amount: '',
    },
  });

  useEffect(() => {
    form.reset({ asset: defaultAsset }, { keepDirtyValues: true });
  }, [defaultAsset, form]);

  return form;
};
