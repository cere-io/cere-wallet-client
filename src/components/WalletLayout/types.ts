import { PropsWithChildren, ReactElement } from 'react';

export type WalletMenuItem = {
  label: string;
  path: string;
  icon: ReactElement;
  comingSoon?: boolean;
};

export type WalletLayoutProps = PropsWithChildren<{
  menu: WalletMenuItem[];
}>;
