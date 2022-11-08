import { FreeportCollectionInterface } from '~/api/interfaces/freeport-collection.interface';
import * as yup from 'yup';

let schema = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
});

export const freeportCollectionValidator = (data: unknown): data is FreeportCollectionInterface => {
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
