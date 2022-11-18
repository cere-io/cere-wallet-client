import { useParams } from 'react-router-dom';
import { CollectibleItemPage } from '~/components';

export const CollectibleItem = () => {
  let { nftId } = useParams();

  return (
    <>
      <CollectibleItemPage nftId={nftId || ''} />
    </>
  );
};
