import { styled, Stack, Box, Container } from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';

const Header = styled(Box)({});
const Content = styled(Box)({});

export const MobileLayout = ({ children }: WalletLayoutProps) => {
  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <Header>Mobile Header</Header>
        <Content>{children}</Content>
      </Stack>
    </Container>
  );
};
