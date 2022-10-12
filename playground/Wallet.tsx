import { Button, Stack } from '@cere-wallet/ui';
import { useCallback, useEffect } from 'react';
import { useWallet, useWalletStatus } from './WalletContext';

export const Wallet = () => {
  const wallet = useWallet();
  const status = useWalletStatus();

  useEffect(() => {
    wallet.init();
  }, [wallet]);

  const handleConnect = useCallback(() => {
    wallet.connect();
  }, [wallet]);

  const handleDisconnect = useCallback(() => {
    wallet.disconnect();
  }, [wallet]);

  return (
    <Stack alignItems="center" paddingY={5}>
      {status === 'connected' ? (
        <Button variant="contained" color="primary" onClick={handleDisconnect}>
          Disconnect wallet
        </Button>
      ) : (
        <Button variant="contained" color="primary" disabled={status === 'not-ready'} onClick={handleConnect}>
          Connect wallet
        </Button>
      )}
    </Stack>
  );
};
