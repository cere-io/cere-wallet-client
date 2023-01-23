import { FAQ } from '~/components';

export const TransferFaq = () => {
  return (
    <FAQ title="FAQ">
      <FAQ.Section title="How long does the transfer take?">
        Usually, it takes a few minutes. Time depends on the network load and can sometimes take up to 24 hours.
      </FAQ.Section>

      <FAQ.Section title="Are there additional fees?">
        The fee is displayed in the Network fee section. The amount of the commission depends on the network load.
      </FAQ.Section>

      <FAQ.Section title="How to transfer NFTs?">
        Switch to the Collectibles tab. Select the NFT you want to transfer and the quantity. Click the Transfer button.
      </FAQ.Section>
    </FAQ>
  );
};
