import { CollectibleItemPage } from '~/components';
import { useParams } from 'react-router-dom';

export const CollectibleItem = () => {
  let { nftId } = useParams();

  return (
    <>
      <CollectibleItemPage nftId={nftId || ''} />
    </>
  );
};
