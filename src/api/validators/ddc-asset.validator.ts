import { DdcAssetInterface } from '~/api/interfaces/ddc-asset.interface';
import * as yup from 'yup';

let schema = yup.object().shape({
  contentMetadata: yup.object({
    contentType: yup.string().required(),
    title: yup.string().required(),
    description: yup.string().required(),
  }),
});

export const DdcAssetValidator = (data: unknown): data is DdcAssetInterface => {
  const result: boolean = schema.isValidSync(data, {});

  // this block only for throwing warning to console
  if (!result) {
    try {
      schema.validateSync(data);
    } catch (err) {
      console.warn(err);
    }
  }

  return result;
};
