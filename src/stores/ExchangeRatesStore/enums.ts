export const ETH = 'eth';
export const MATIC = 'matic';
export const MATIC_ID = 'matic-network';
export const MUMBAI = 'mumbai';
export const MAINNET = 'mainnet';
export const USD = 'usd';
export const BTC = 'btc';
export const USDC = 'usdc';
export const USDC_ID = 'usd-coin';
export const CERE = 'cere';
export const CERE_ID = 'cere-network';

export const MUMBAI_CHAIN_ID = '0x13881';
export const MATIC_CHAIN_ID = '0x89';

export enum MATIC_PLATFORMS {
  POLIGON = 'polygon-pos',
}

export const TOKENS = [
  { id: MATIC_ID, name: MATIC },
  { id: USDC_ID, name: USDC },
  { id: CERE_ID, name: CERE },
];

export const COINGECKO_PLATFORMS_CHAIN_CODE_MAP: Record<string, { platform: string; currency: string }> = {
  [MUMBAI_CHAIN_ID]: {
    platform: MATIC_PLATFORMS.POLIGON,
    currency: MATIC,
  },
  [MATIC_CHAIN_ID]: {
    platform: MATIC_PLATFORMS.POLIGON,
    currency: MATIC,
  },
};

export const COINGECKO_SUPPORTED_CURRENCIES = [BTC, ETH, USD];

export const DEFAULT_RATE = 0;

export const NETWORKS_LIST = [{ value: 'Ethereum', type: 'ERC20', name: 'Ethereum' }];
