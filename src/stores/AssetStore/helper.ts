import { Asset } from '../types';

export function serializeAssets(assets: Asset[]) {
  return assets.map((el) => ({
    ticker: el.symbol,
    displayName: el.displayName,
    network: el.network,
    address: el.address,
    thumb: el.thumb,
    symbol: el.symbol,
    decimals: el.decimals,
    balance: el.balance,
  }));
}
