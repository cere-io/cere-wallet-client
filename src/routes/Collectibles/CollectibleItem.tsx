import { PageHeader, CollectibleItemPage } from '~/components';
import { useParams } from 'react-router-dom';

export const CollectibleItem = () => {
  let { nftId } = useParams();

  return (
    <>
      <PageHeader title="Collectables" />

      <CollectibleItemPage nftId={nftId || ''} />
    </>
  );
};
