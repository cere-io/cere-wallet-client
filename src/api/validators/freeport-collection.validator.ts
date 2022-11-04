import { FreeportCollectionInterface } from '~/api/interfaces/freeport-collection.interface';

export const freeportCollectionValidator = (data: unknown): data is FreeportCollectionInterface => {
  const collection = data as FreeportCollectionInterface;
  return typeof collection?.name === 'string' && typeof collection?.address === 'string';
};
