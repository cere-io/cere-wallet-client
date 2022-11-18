import * as yup from 'yup';
import { DdcAssetInterface } from '~/api/interfaces/ddc-asset.interface';

let schema = yup.object().shape({
  contentMetadata: yup.object({
    contentType: yup.string().required(),
    title: yup.string().required(),
    description: yup.string().required(),
  }),
});

export const DdcAssetValidator = (data: unknown): data is DdcAssetInterface => {
  let result: boolean = false;

  try {
    schema.validateSync(data);
    result = true;
  } catch (err) {
    console.warn(err);
  }

  return result;
};
