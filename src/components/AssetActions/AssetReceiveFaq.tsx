import { Link } from '@cere/ui';
import { FAQ } from '~/components';

export const AssetReceiveFaq = () => {
  return (
    <FAQ title="FAQ">
      <FAQ.Section title="How to fund my wallet by sending USDC?">
        Fund your wallet with USDC. Send USDC from an exchange or other wallet via{' '}
        <Link target="_blank" href="https://polygon.technology/">
          Polygon network
        </Link>{' '}
        to this wallet address.
      </FAQ.Section>

      <FAQ.Section title="What address should I use?">
        Polygon address is an ERC20 address which can be used for any ERC20 network like Polygon network or Ethereum.
      </FAQ.Section>

      <FAQ.Section title="How can I buy USDC?">
        Buy USDC on Polygon network directly via an exchange and send the funds to this wallet address. Or buy USDC on
        Ethereum network and use the{' '}
        <Link target="_blank" href="https://wallet.polygon.technology/bridge/">
          Polygon bridge
        </Link>{' '}
        to bridge the funds from Ethereum network to Polygon network. After which you can send the funds to this wallet
        address on Polygon network.
      </FAQ.Section>
    </FAQ>
  );
};
