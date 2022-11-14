import { FreeportCollectionInterface } from '~/api/interfaces/freeport-collection.interface';
import * as yup from 'yup';

let schema = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
});

export const freeportCollectionValidator = (data: unknown): data is FreeportCollectionInterface => {
  let result: boolean = false;

  try {
    schema.validateSync(data);
    result = true;
  } catch (err) {
    console.warn(err);
  }

  return result;
};
