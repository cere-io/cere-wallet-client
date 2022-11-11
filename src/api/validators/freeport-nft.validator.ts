import { FreeportNftInterface } from '~/api/interfaces/freeport-nft.interface';
import * as yup from 'yup';

let schema = yup.object().shape({
  nftId: yup.string().required(),
  minter: yup.string().required(),
  collectionAddress: yup.string().nullable(true),
  supply: yup.number().required(),
  quantity: yup.number().required(),
  priceInUsdCents: yup.number().required(),
  priceInCereUnits: yup.number().required(),
});

export const freeportNftValidator = (data: unknown): data is FreeportNftInterface => {
  let result: boolean = false;

  try {
    schema.validateSync(data);
    result = true;
  } catch (err) {
    console.warn(err);
  }

  return result;
};
