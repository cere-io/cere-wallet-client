import { PropsWithChildren, ReactElement } from 'react';

type WalletMenuItem = {
  label: string;
  path: string;
  icon: ReactElement;
  comingSoon?: boolean;
};

export type WalletLayoutProps = PropsWithChildren<{
  menu: WalletMenuItem[];
}>;
