import { Asset } from '../types';
export type { Asset, ReadyWallet, Wallet } from '../types';

export type TransferableAsset = Asset & {
  transfer(to: string, amount: string): Promise<unknown>;
};

export const isTransferableAsset = (asset: any): asset is TransferableAsset => typeof asset.transfer === 'function';
