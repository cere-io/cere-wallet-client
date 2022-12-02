export const ETH = 'eth';
export const MATIC = 'matic';
export const MATIC_ID = 'matic';
export const MUMBAI = 'mumbai';
export const MAINNET = 'mainnet';
export const USD = 'usd';

export const MUMBAI_CHAIN_ID = '0x13881';

export const tokens = [{ id: 'matic-network', name: MATIC }];

export const COINGECKO_PLATFORMS_CHAIN_CODE_MAP: Record<string, { platform: string; currency: string }> = {
  [MUMBAI_CHAIN_ID]: {
    platform: 'polygon-pos',
    currency: MATIC,
  },
};

export const COINGECKO_SUPPORTED_CURRENCIES = ['btc', 'eth', 'usd'];
