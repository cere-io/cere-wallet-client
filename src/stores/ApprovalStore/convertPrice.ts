import { BigNumber } from 'ethers';
import type { TokenConfig } from '@cere-wallet/wallet-engine';

export const convertPrice = (amount: BigNumber, { decimals }: TokenConfig) => {
  return amount.div(10 ** decimals).toNumber();
};
