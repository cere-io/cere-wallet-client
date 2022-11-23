import { Button, Stack } from '@cere-wallet/ui';
import { providers } from 'ethers';
import { useCallback, useEffect } from 'react';

import { logoUrl, nftImageUrl } from './assets';
import { useWallet, useWalletStatus } from './WalletContext';

export const Wallet = () => {
  const wallet = useWallet();
  const status = useWalletStatus();

  useEffect(() => {
    wallet.init({
      env: 'local',
      context: {
        app: {
          name: 'Cere wallet playground',
          url: window.origin,
          logoUrl,
        },
      },
    });
  }, [wallet]);

  const handleConnect = useCallback(() => {
    wallet.connect();
  }, [wallet]);

  const handleDisconnect = useCallback(() => {
    wallet.disconnect();
  }, [wallet]);

  const handleUserInfo = useCallback(async () => {
    const info = await wallet.getUserInfo();

    console.log('User Info', info);
  }, [wallet]);

  const handleGetAddress = useCallback(async () => {
    const provider = new providers.Web3Provider(wallet.provider);
    const signer = provider.getSigner();

    const address = await signer.getAddress();

    alert(`Address: ${address}`);
  }, [wallet]);

  const handleShowWallet = useCallback(async () => {
    wallet.showWallet();
  }, [wallet]);

  const handleTopUp = useCallback(async () => {
    wallet.showWallet('topup');
  }, [wallet]);

  const handleSetContext = useCallback(async () => {
    wallet.setContext({
      banner: {
        thumbnailUrl: nftImageUrl,
        badgeUrl: logoUrl,
        content: [
          {
            text: 'You’re about to purchase:',
            variant: 'secondary',
          },

          {
            text: 'Pixel Vault NFT',
            variant: 'primary',
          },
        ],

        right: [
          {
            text: '100 USDC',
            variant: 'primary',
            color: 'primary.main',
          },

          {
            text: 'Required',
            variant: 'secondary',
          },
        ],
      },
    });
  }, [wallet]);

  const handleUnsetContext = useCallback(async () => {
    wallet.setContext(null);
  }, [wallet]);

  const handlePersonalSign = useCallback(async () => {
    const provider = new providers.Web3Provider(wallet.provider);
    const signer = provider.getSigner();

    const signed = await signer.signMessage('Hello!!!');

    console.log(`Signed message: ${signed}`);
  }, [wallet]);

  const handleGetAccounts = useCallback(async () => {
    const accounts = await wallet.getAccounts();

    console.log(accounts);
  }, [wallet]);

  return (
    <Stack alignItems="center" spacing={2} paddingY={5}>
      <Button variant="outlined" color="primary" onClick={handleSetContext}>
        Set context
      </Button>

      <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleUnsetContext}>
        Unset context
      </Button>

      {status === 'connected' || status === 'disconnecting' ? (
        <>
          <Button variant="outlined" color="primary" onClick={handleGetAddress}>
            Get Address
          </Button>

          <Button variant="outlined" color="primary" onClick={handleGetAccounts}>
            Get Accounts
          </Button>

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleUserInfo}>
            Get User Info
          </Button>

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handlePersonalSign}>
            Sign message
          </Button>

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleShowWallet}>
            Show wallet
          </Button>

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleTopUp}>
            Top Up
          </Button>

          <Button variant="contained" color="primary" disabled={status === 'disconnecting'} onClick={handleDisconnect}>
            Disconnect wallet
          </Button>

          <Button variant="contained" color="primary" disabled={status === 'disconnecting'} onClick={handleConnect}>
            Connect wallet
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          disabled={status === 'not-ready' || status === 'connecting'}
          onClick={handleConnect}
        >
          Connect wallet
        </Button>
      )}
    </Stack>
  );
};
