import { WalletAccount, WalletBalance } from '@cere/embed-wallet';
import { Button, Divider, Stack, Typography } from '@cere-wallet/ui';
import { providers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

import { logoUrl, nftImageUrl } from './assets';
import { useWallet, useWalletStatus } from './WalletContext';

export const Wallet = () => {
  const [ethAddress, setEthAddress] = useState<string>();
  const [ethBalance, setEthBalance] = useState<string>(); // TODO: Implement
  const [cereAddress, setCereAddress] = useState<string>();
  const [cereBalance, setCereBalance] = useState<string>();

  const wallet = useWallet();
  const status = useWalletStatus();

  useEffect(() => {
    wallet.init({
      env: 'local',
      connectOptions: {
        mode: 'modal',
      },
      context: {
        app: {
          appId: 'cere-wallet-playground',
          name: 'Cere wallet playground',
          url: window.origin,
          logoUrl,
        },
      },
    });

    wallet.subscribe('balance-update', ({ amount }: WalletBalance) => {
      setCereBalance(amount.toString());
    });

    wallet.subscribe('accounts-update', ([ethAccount, cereAccount]: WalletAccount[]) => {
      setCereAddress(cereAccount?.address);
      setEthAddress(ethAccount?.address);
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

  const handleCereTransfer = useCallback(async () => {
    const txHash = await wallet.transfer({
      token: 'CERE',
      amount: 1,
      to: '5G14JbHGvQPN9P26BNfguNhCKdfG7iU9JRfTJaJPe2K6R3ey',
    });

    console.log('TX', txHash);
  }, [wallet]);

  return (
    <Stack alignItems="center" spacing={2} paddingY={5}>
      {status === 'connected' && (
        <>
          <Divider flexItem>
            <Typography color="text.caption">Wallet</Typography>
          </Divider>

          {ethAddress && (
            <Stack spacing={1} alignItems="center">
              <Typography width={150} fontWeight="bold" align="center">
                Ethereum Address
              </Typography>
              <Typography variant="body2" align="center">
                {ethAddress}
              </Typography>
            </Stack>
          )}

          {cereAddress && (
            <Stack spacing={1} alignItems="center">
              <Typography width={150} fontWeight="bold" align="center">
                Cere Address
              </Typography>
              <Typography variant="body2" align="center">
                {cereAddress}
              </Typography>
            </Stack>
          )}

          {ethBalance && (
            <Stack spacing={1} alignItems="center">
              <Typography width={150} fontWeight="bold" align="center">
                Ethereum Balance
              </Typography>
              <Typography variant="body2" align="center">
                {ethBalance}
              </Typography>
            </Stack>
          )}

          {cereBalance && (
            <Stack spacing={1} alignItems="center">
              <Typography width={150} fontWeight="bold" align="center">
                Cere Balance
              </Typography>
              <Typography variant="body2" align="center">
                {cereBalance}
              </Typography>
            </Stack>
          )}
        </>
      )}

      <Divider flexItem>
        <Typography color="text.caption">Actions</Typography>
      </Divider>
      <Button variant="outlined" color="primary" onClick={handleSetContext}>
        Set context
      </Button>

      <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleUnsetContext}>
        Unset context
      </Button>

      <Button variant="outlined" color="primary" onClick={handleGetAccounts}>
        Get Accounts
      </Button>

      {status === 'connected' || status === 'disconnecting' ? (
        <>
          <Button variant="outlined" color="primary" onClick={handleGetAddress}>
            Get Address
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

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleCereTransfer}>
            Transfer 1 $CERE
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
