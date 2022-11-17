import { observer } from 'mobx-react-lite';
import { styled, Stack, Typography, useIsMobile } from '@cere-wallet/ui';
import { useAccountStore } from '~/hooks';
import { Alert, Link } from '@cere/ui';
import { useAlertVisible } from '~/routes/TopUp/useAlertVisible';
import { FAQ } from '~/components';
import { useCallback, useState } from 'react';
import { ASSET_REFILL_PROVIDER_LIST } from './AssetRefillProviders';
import { AssetDeposit } from './AssetDeposit';
import { AssetDepositProvider } from './AssetDepositProvider';

const Providers = styled(Stack)(({ theme }) => ({
  '& > div': {
    border: `0.063rem solid ${theme.palette.divider}`,
    borderBottom: `none`,
    padding: `0.5rem 1rem 1rem 1rem`,
    [theme.breakpoints.up('md')]: {
      padding: `1.5rem`,
    },
  },
  '& > div:first-of-type': {
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
  },
  '& > div:last-of-type': {
    borderBottom: `0.063rem solid ${theme.palette.divider}`,
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
  },
}));

const AssetBuyPage = () => {
  const isMobile = useIsMobile();
  const { account } = useAccountStore();
  const [isAlertVisible, hideAlert] = useAlertVisible('assetBuyTopAlert');
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);

  const selectProviderHandler = useCallback((i: number) => {
    setSelectedProvider(i);
    setTimeout(() => {
      const element = document.getElementById('purchase');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, []);

  if (!account) {
    return <></>;
  }

  return (
    <Stack display="grid" gridTemplateColumns="repeat(9, 1fr)" rowGap={2} columnGap={4}>
      <Stack gridColumn={isMobile ? '1/10' : '1/6'} spacing={1}>
        {isAlertVisible && (
          <Alert severity="info" color="neutral" onClose={hideAlert}>
            Buy USDC directly on Polygon Network or{' '}
            <Link target="_blank" href="https://polygon.technology/">
              bridge USDC over to Polygon network
            </Link>{' '}
            from Ethereum ERC20 network.
          </Alert>
        )}
        <Typography fontWeight="bold">Select a Provider</Typography>
        {ASSET_REFILL_PROVIDER_LIST.length && (
          <Providers borderRadius={2}>
            {ASSET_REFILL_PROVIDER_LIST.map((params, i) => (
              <AssetDepositProvider
                name={params.name}
                logo={params.logo}
                payMethodList={params.payMethodList}
                fees={params.fees}
                limits={params.limits}
                assetList={params.assetList}
                key={`depositProvider-${i}`}
                spacing={isMobile ? 0.5 : 0.375}
                checked={i === selectedProvider}
                onClick={() => selectProviderHandler(i)}
              />
            ))}
          </Providers>
        )}
      </Stack>
      <Stack gridColumn={isMobile ? '1/10' : '6/10'} spacing={3}>
        {selectedProvider !== null && (
          <AssetDeposit
            id="purchase"
            borderRadius={4}
            address={account.address}
            spacing={2}
            padding={2}
            logo={ASSET_REFILL_PROVIDER_LIST[selectedProvider].smallLogo}
            name={ASSET_REFILL_PROVIDER_LIST[selectedProvider].name}
          />
        )}
        <FAQ title="FAQ">
          <FAQ.Section title="How can I buy USDC with Cere wallet??">
            Buy USDC directly with Cere wallet via an available provider where you can use your credit card to get
            cryptocurrency in return on your wallet address
          </FAQ.Section>

          <FAQ.Section title="What address should I use?">
            Polygon address is an ERC20 address which can be used for any ERC20 network like Polygon network or
            Ethereum.
          </FAQ.Section>

          <FAQ.Section title="How long does the Top Up take?">
            Top up via a provider can take a few minutes up to 24 hours. It depends on the verification process and bank
            processing times.
          </FAQ.Section>

          <FAQ.Section title="What do I need to use a provider?">
            Depending on the country you are from and bank you use, you may need identification documents and your
            banking or credit card application. The provider will explain what you need and how you need to verify
            yourself before you need to pay something.
          </FAQ.Section>
        </FAQ>
      </Stack>
    </Stack>
  );
};

export default observer(AssetBuyPage);
