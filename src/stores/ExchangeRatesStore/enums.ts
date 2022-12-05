export const ETH = 'eth';
export const MATIC = 'matic';
export const MATIC_ID = 'matic-network';
export const MUMBAI = 'mumbai';
export const MAINNET = 'mainnet';
export const USD = 'usd';

export const USDC = 'usdc';
export const USDC_ID = 'usd-coin';

export const MUMBAI_CHAIN_ID = '0x13881';

export const TOKENS = [
  { id: MATIC_ID, name: MATIC },
  { id: USDC_ID, name: USDC },
];

export const COINGECKO_PLATFORMS_CHAIN_CODE_MAP: Record<string, { platform: string; currency: string }> = {
  [MUMBAI_CHAIN_ID]: {
    platform: 'polygon-pos',
    currency: MATIC,
  },
};

export const COINGECKO_SUPPORTED_CURRENCIES = ['btc', 'eth', 'usd'];

export const DEFAULT_RATE = 0;
