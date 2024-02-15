import { BigNumber, utils } from 'ethers';
import type { TokenConfig } from '@cere-wallet/wallet-engine';

export const convertPrice = (amount: BigNumber, { decimals }: TokenConfig) => {
  return +utils.formatUnits(amount, decimals);
};
