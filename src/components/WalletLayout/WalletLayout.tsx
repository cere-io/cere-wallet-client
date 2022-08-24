import { Container } from '@cere-wallet/ui';
import { PropsWithChildren } from 'react';

export type WalletLayoutProps = PropsWithChildren<{}>;

export const WalletLayout = ({ children }: WalletLayoutProps) => {
  return <Container maxWidth="sm">{children}</Container>;
};
