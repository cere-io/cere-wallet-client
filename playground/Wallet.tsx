import { Button, Stack } from '@cere-wallet/ui';
import { providers } from 'ethers';
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

  const handleGetAddress = useCallback(async () => {
    const provider = new providers.Web3Provider(wallet.provider);
    const signer = provider.getSigner();

    const address = await signer.getAddress();

    alert(`Address: ${address}`);
  }, [wallet]);

  return (
    <Stack alignItems="center" spacing={2} paddingY={5}>
      {status === 'connected' || status === 'disconnecting' ? (
        <>
          <Button variant="outlined" color="primary" onClick={handleGetAddress}>
            Get Address
          </Button>

          <Button variant="contained" color="primary" disabled={status === 'disconnecting'} onClick={handleDisconnect}>
            Disconnect wallet
          </Button>

          <Button variant="contained" color="primary" disabled={status === 'disconnecting'} onClick={handleConnect}>
            Connect wallet
          </Button>
        </>
      ) : (
        <Button variant="contained" color="primary" disabled={status === 'not-ready'} onClick={handleConnect}>
          Connect wallet
        </Button>
      )}
    </Stack>
  );
};
