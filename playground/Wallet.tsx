import { Button, Stack } from '@cere-wallet/ui';
import { useCallback, useEffect } from 'react';
import { useWallet, useWalletStatus } from './WalletContext';

export const Wallet = () => {
  const wallet = useWallet();
  const status = useWalletStatus();

  useEffect(() => {
    wallet.init({
      env: 'local',
      network: {
        host: 'https://polygon-mumbai.infura.io/v3/248b37a1123943a9b5c975eb2c93a2ab',
        chainId: 80001,
      },
    });
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
