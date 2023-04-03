import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { isValidAddress } from '@cere-wallet/wallet-engine';

import { Asset } from '~/stores';
import { BigNumber } from 'ethers';

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

      const amount = BigNumber.from(value);
      const balance = BigNumber.from(selectedAsset.balance);

      return balance.gte(amount)
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
      address: '',
      amount: '',
    },
  });
