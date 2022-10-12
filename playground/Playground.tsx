import { Container, UIProvider } from '@cere-wallet/ui';

import { Wallet } from './Wallet';
import { WalletProvider } from './WalletContext';

export const Playground = () => (
  <UIProvider>
    <WalletProvider>
      <Container maxWidth="md">
        <Wallet />
      </Container>
    </WalletProvider>
  </UIProvider>
);
