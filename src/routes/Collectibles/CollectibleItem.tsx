import { PageHeader, CollectibleItemPage } from '~/components';
import { useParams } from 'react-router-dom';

export const CollectibleItem = () => {
  let { nftId } = useParams();

  console.log('NftId', nftId);

  return (
    <>
      <PageHeader title="Collectables" />

      <CollectibleItemPage nftId={nftId || ''} />
    </>
  );
};
