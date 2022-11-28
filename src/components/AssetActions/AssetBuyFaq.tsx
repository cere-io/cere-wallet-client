import { FAQ } from '~/components';

export const AssetBuyFaq = () => {
  return (
    <FAQ title="FAQ">
      <FAQ.Section title="How can I buy USDC with Cere wallet??">
        Buy USDC directly with Cere wallet via an available provider where you can use your credit card to get
        cryptocurrency in return on your wallet address
      </FAQ.Section>

      <FAQ.Section title="What address should I use?">
        Polygon address is an ERC20 address which can be used for any ERC20 network like Polygon network or Ethereum.
      </FAQ.Section>

      <FAQ.Section title="How long does the Top Up take?">
        Top up via a provider can take a few minutes up to 24 hours. It depends on the verification process and bank
        processing times.
      </FAQ.Section>

      <FAQ.Section title="What do I need to use a provider?">
        Depending on the country you are from and bank you use, you may need identification documents and your banking
        or credit card application. The provider will explain what you need and how you need to verify yourself before
        you need to pay something.
      </FAQ.Section>
    </FAQ>
  );
};
