import { FreeportNftInterface } from '~/api/interfaces/freeport-nft.interface';

export const freeportNftValidator = (data: unknown): data is FreeportNftInterface => {
  const nft = data as FreeportNftInterface;
  return (
    typeof nft?.nftId === 'string' &&
    typeof nft?.minter === 'string' &&
    (typeof nft?.collectionAddress === 'string' || nft?.collectionAddress === null) &&
    typeof nft?.supply === 'number' &&
    typeof nft?.quantity === 'number' &&
    typeof nft?.priceInUsdCents === 'number' &&
    typeof nft?.priceInCereUnits === 'number'
  );
};
