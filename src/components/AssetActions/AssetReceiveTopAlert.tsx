import { Alert, Link } from '@cere/ui';
import { useAlertVisible } from '~/hooks';

export const AssetReceiveTopAlert = () => {
  const [isAlertVisible, hideAlert] = useAlertVisible('assetReceiveTopAlert');
  return (
    <>
      {isAlertVisible && (
        <Alert severity="info" color="neutral" onClose={hideAlert}>
          Fund your wallet with USDC. Send USDC from an exchange or other wallet via{' '}
          <Link target="_blank" href="https://polygon.technology/">
            Polygon network
          </Link>{' '}
          to this wallet address.
        </Alert>
      )}
    </>
  );
};
