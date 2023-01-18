import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import BigNumber from 'bignumber.js';
import { isValidAddress } from '@cere-wallet/wallet-engine';

import { Asset } from '~/stores';

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
      'Should be ethereum address format',
      (value) => !!value && isValidAddress(value, 'ethereum'),
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

      const amount = new BigNumber(value);
      const balance = new BigNumber(selectedAsset.balance);

      return balance.isGreaterThanOrEqualTo(amount)
        ? true
        : createError({
            message: `Not enough tokens to transfer. Available balance is ${selectedAsset.balance} ${selectedAsset.displayName}`,
          });
    }),
});

export const useTransferForm = ({ assets }: UseTransferFormOptions) =>
  useForm({
    context: { assets },
    resolver: yupResolver(validationSchema),
    defaultValues: {
      asset: assets[0].ticker,
      address: '', // 0x9317382d69804b22f2b5d1779ecbf62c8c11aa67
      amount: '',
    },
  });
