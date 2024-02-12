import { WalletAccount, WalletBalance } from '@cere/embed-wallet';
import { Button, Divider, Stack, Typography } from '@cere-wallet/ui';
import { providers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

import { logoUrl, nftImageUrl } from './assets';
import { useWallet, useWalletStatus } from './WalletContext';

export const Wallet = () => {
  const [ethAddress, setEthAddress] = useState<string>();
  const [ethBalance, setEthBalance] = useState<string>();
  const [cereAddress, setCereAddress] = useState<string>();
  const [cereBalance, setCereBalance] = useState<string>();
  const [isNewUser, setIsNewUser] = useState(false);

  const wallet = useWallet();
  const status = useWalletStatus();

  useEffect(() => {
    wallet.init({
      connectOptions: {
        permissions: {
          personal_sign: {},
          ed25519_signRaw: {},
        },
      },

      context: {
        whiteLabel: {
          var1: 'value',
          skipLoginIntro: true,
          mainColor: '#000000',
        },

        app: {
          appId: 'cere-wallet-playground',
          name: 'Cere wallet playground',
          logoUrl,
        },
      },
    });

    wallet.isReady.then((readyWallet) => {
      console.log('Ready wallet (isReady)', readyWallet);
    });

    wallet.subscribe('status-update', (status, prevStatus) => {
      console.log('Status update', { status, prevStatus });
    });

    wallet.subscribe('balance-update', ({ amount, type }: WalletBalance) => {
      if (type === 'native') {
        setCereBalance(amount.toString());
      }

      if (type === 'erc20') {
        setEthBalance(amount.toString());
      }
    });

    wallet.subscribe('accounts-update', (accounts: WalletAccount[]) => {
      console.log(
        'accounts-update',
        accounts.map((account) => account.address),
      );

      const [ethAccount, cereAccount] = accounts;

      setCereAddress(cereAccount?.address);
      setEthAddress(ethAccount?.address);
    });

    window.addEventListener('focus', () => {
      console.log('Host window received focus');
    });

    window.addEventListener('blur', () => {
      console.log('Host window lost focus');
    });
  }, [wallet]);

  const handleConnect = useCallback(async () => {
    await wallet.connect();
    const userInfo = await wallet.getUserInfo();

    console.log('userInfo', userInfo);
    setIsNewUser(userInfo.isNewUser);
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
      whiteLabel: {
        skipLoginIntro: true,
      },
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

  const handleEd25519Sign = useCallback(async () => {
    const [, cereAccount] = await wallet.getAccounts();
    const signed = await wallet.provider.request({
      method: 'ed25519_signRaw',
      params: [cereAccount.address, 'Hello!!!'],
    });

    console.log(`Signed message: ${signed}`);
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

  const handleCereNativeTransfer = useCallback(async () => {
    const txHash = await wallet.transfer({
      token: 'CERE',
      type: 'native',
      amount: 1,
      to: '6Pwq4GK8T6bJWDSJMdsGffXxrVoVULaKQfNfSprLtgha9c2k', // wallet-playground@cere.io
    });

    console.log('TX', txHash);
  }, [wallet]);

  const handleCereErc20Transfer = useCallback(async () => {
    const txHash = await wallet.transfer({
      token: 'CERE',
      type: 'erc20',
      amount: 1,
      to: '0xe6817abe87e8d8faa98c86295165c5f93e5dc8c6', // wallet-playground@cere.io
    });

    console.log('TX', txHash);
  }, [wallet]);

  const handleDangerousRedirectLogin = useCallback(() => {
    wallet.connect({
      mode: 'redirect',
      redirectUrl: 'https://evil.com/auth',
    });
  }, [wallet]);

  const handleGetPermissions = useCallback(async () => {
    const permissions = await wallet.getPermissions();

    console.log('Wallet permissions', permissions);
  }, [wallet]);

  const handleRequestPermissions = useCallback(async () => {
    const permissions = await wallet.requestPermissions({
      personal_sign: {},
      ed25519_signRaw: {},
    });

    console.log('Approved permissions', permissions);
  }, [wallet]);

  const handleRevokePermissions = useCallback(async () => {
    await wallet.revokePermissions({
      personal_sign: {},
      ed25519_signRaw: {},
    });

    console.log('Permissions revoked');
  }, [wallet]);

  return (
    <Stack alignItems="center" spacing={2} paddingY={5}>
      {status === 'connected' && (
        <>
          <Divider flexItem>
            <Typography color="text.caption">{isNewUser && <b>New </b>}Wallet</Typography>
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
              <Typography width={200} fontWeight="bold" align="center">
                $CERE ERC20 Balance
              </Typography>
              <Typography variant="body2" align="center">
                {ethBalance}
              </Typography>
            </Stack>
          )}

          {cereBalance && (
            <Stack spacing={1} alignItems="center">
              <Typography width={200} fontWeight="bold" align="center">
                $CERE Native Balance
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
            Sign message (eth)
          </Button>

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleEd25519Sign}>
            Sign message (ed25519)
          </Button>

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleShowWallet}>
            Show wallet
          </Button>

          <Button variant="outlined" color="primary" disabled={status === 'disconnecting'} onClick={handleTopUp}>
            Top Up
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={status === 'disconnecting'}
            onClick={handleCereNativeTransfer}
          >
            Transfer 1 $CERE (Native)
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={status === 'disconnecting'}
            onClick={handleCereErc20Transfer}
          >
            Transfer 1 $CERE (ERC20)
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={status === 'disconnecting'}
            onClick={handleGetPermissions}
          >
            Get permissions
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={status === 'disconnecting'}
            onClick={handleRequestPermissions}
          >
            Request permissions
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={status === 'disconnecting'}
            onClick={handleRevokePermissions}
          >
            Revoke permissions
          </Button>

          <Button variant="contained" color="primary" disabled={status === 'disconnecting'} onClick={handleDisconnect}>
            Disconnect wallet
          </Button>

          <Button variant="contained" color="primary" disabled={status === 'disconnecting'} onClick={handleConnect}>
            Connect wallet
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            disabled={status === 'not-ready' || status === 'connecting'}
            onClick={handleConnect}
          >
            Connect wallet
          </Button>

          <Button
            variant="contained"
            color="warning"
            disabled={status === 'not-ready' || status === 'connecting'}
            onClick={handleDangerousRedirectLogin}
          >
            Danger Connect
          </Button>
        </>
      )}
    </Stack>
  );
};
