import { DdcAssetInterface } from '~/api/interfaces/ddc-asset.interface';

export const DdcAssetValidator = (data: unknown): data is DdcAssetInterface => {
  const asset = data as DdcAssetInterface;
  return (
    typeof asset?.contentMetadata?.contentType === 'string' &&
    typeof asset?.contentMetadata?.title === 'string' &&
    typeof asset?.contentMetadata?.description === 'string'
  );
};
