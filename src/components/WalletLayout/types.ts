import { PropsWithChildren, ReactElement } from 'react';

type WalletMenuItem = {
  label: string;
  path: string;
  icon: ReactElement;
};

export type WalletLayoutProps = PropsWithChildren<{
  menu: WalletMenuItem[];
}>;
