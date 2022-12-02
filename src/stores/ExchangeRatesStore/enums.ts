export const ETH = 'eth';
export const MATIC = 'matic';
export const MUMBAI = 'mumbai';
export const MAINNET = 'mainnet';
export const USD = 'usd';

export const MAINNET_CODE = 1;
export const GOERLI_CODE = 5;
export const SEPOLIA_CODE = 11_155_111;
export const MATIC_CODE = 137;
export const MUMBAI_CODE = 80_001;

export const MAINNET_CHAIN_ID = '0x1';
export const ROPSTEN_CHAIN_ID = '0x3';
export const RINKEBY_CHAIN_ID = '0x4';
export const KOVAN_CHAIN_ID = '0x2a';
export const GOERLI_CHAIN_ID = '0x5';
export const MATIC_CHAIN_ID = '0x89';
export const MUMBAI_CHAIN_ID = '0x13881';

export const tokens = [{ id: 'matic-network', name: MATIC }];

export const COINGECKO_PLATFORMS_CHAIN_CODE_MAP: Record<string, { platform: string; currency: string }> = {
  [MUMBAI_CHAIN_ID]: {
    platform: 'polygon-pos',
    currency: 'matic',
  },
};

export const COINGECKO_SUPPORTED_CURRENCIES = ['btc', 'eth', 'usd'];
