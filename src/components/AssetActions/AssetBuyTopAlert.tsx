import { Alert, Link } from '@cere-wallet/ui';
import { useAlertVisible } from '~/hooks';

export const AssetBuyTopAlert = () => {
  const [isAlertVisible, hideAlert] = useAlertVisible('assetBuyTopAlert');
  return (
    <>
      {isAlertVisible && (
        <Alert severity="info" color="neutral" onClose={hideAlert}>
          Buy USDC directly on Polygon Network or{' '}
          <Link target="_blank" href="https://polygon.technology/">
            bridge USDC over to Polygon network
          </Link>{' '}
          from Ethereum ERC20 network.
        </Alert>
      )}
    </>
  );
};
