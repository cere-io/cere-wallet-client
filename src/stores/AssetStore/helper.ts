import { Asset } from '../types';

export function serializeAssets(assets: Asset[]) {
  return JSON.stringify(
    assets.map((el) => ({
      displayName: el.displayName,
      network: el.network,
      address: el.address,
      thumb: el.thumb,
      ticker: el.ticker,
      decimals: el.decimals,
      balance: el.balance,
    })),
  );
}

export function deserializeAssets(assetsString: string | null) {
  if (assetsString) {
    return JSON.parse(assetsString);
  }
}
