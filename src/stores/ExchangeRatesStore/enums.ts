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
export const LOCALHOST_CODE = 5777;
export const BSC_MAINNET_CODE = 56;
export const BSC_TESTNET_CODE = 97;
export const OKC_MAINNET_CODE = 66;
export const OKC_TESTNET_CODE = 65;
export const XDAI_CODE = 100;
export const RSK_MAINNET_CODE = 30;
export const RSK_TESTNET_CODE = 31;
export const REEF_CODE = 101;
export const ARBITRUM_MAINNET_CODE = 42_161;
export const ARBITRUM_TESTNET_CODE = 421_611;
export const OPTIMISM_MAINNET_CODE = 10;
export const OPTIMISM_TESTNET_CODE = 69;
export const AVALANCHE_MAINNET_CODE = 43_114;
export const AVALANCHE_TESTNET_CODE = 43_113;
export const GXC_TESTNET_CODE = 1068;
export const VOC_TESTNET_CODE = 1172;

export const MAINNET_CHAIN_ID = '0x1';
export const ROPSTEN_CHAIN_ID = '0x3';
export const RINKEBY_CHAIN_ID = '0x4';
export const KOVAN_CHAIN_ID = '0x2a';
export const GOERLI_CHAIN_ID = '0x5';
export const MATIC_CHAIN_ID = '0x89';
export const MUMBAI_CHAIN_ID = '0x13881';
export const BSC_MAINNET_CHAIN_ID = '0x38';
export const BSC_TESTNET_CHAIN_ID = '0x61';
export const OKC_MAINNET_CHAIN_ID = '0x42';
export const OKC_TESTNET_CHAIN_ID = '0x41';
export const XDAI_CHAIN_ID = '0x64';
export const REEF_CHAIN_ID = '0x65';
export const RSK_MAINNET_CHAIN_ID = '0x1e';
export const RSK_TESTNET_CHAIN_ID = '0x1f';
export const ARBITRUM_MAINNET_CHAIN_ID = '0xa4b1';
export const ARBITRUM_TESTNET_CHAIN_ID = '0x66eeb';
export const OPTIMISM_MAINNET_CHAIN_ID = '0xa';
export const OPTIMISM_TESTNET_CHAIN_ID = '0x45';
export const AVALANCHE_MAINNET_CHAIN_ID = '0xa86a';
export const AVALANCHE_TESTNET_CHAIN_ID = '0xa869';
export const GXC_TESTNET_CHAIN_ID = '0x42c';

export const tokens = [{ id: 'matic-network', name: MATIC }];

export const COINGECKO_PLATFORMS_CHAIN_CODE_MAP: Record<number, { platform: string; currency: string }> = {
  [MATIC_CODE]: {
    platform: 'polygon-pos',
    currency: 'matic',
  },
  [BSC_MAINNET_CODE]: {
    platform: 'binance-smart-chain',
    currency: 'bnb',
  },
  [OKC_MAINNET_CODE]: {
    platform: 'oec-token',
    currency: 'okt',
  },
  [MAINNET_CODE]: {
    platform: 'ethereum',
    currency: 'eth',
  },
  [RSK_MAINNET_CODE]: {
    platform: 'rootstock',
    currency: 'rbtc',
  },
  [ARBITRUM_MAINNET_CODE]: {
    platform: 'arbitrum-one',
    currency: 'eth',
  },
  [OPTIMISM_MAINNET_CODE]: {
    platform: 'optimistic-ethereum',
    currency: 'eth',
  },
  [XDAI_CODE]: {
    platform: 'xdai',
    currency: 'xDAI',
  },
  [AVALANCHE_MAINNET_CODE]: {
    platform: 'avalanche',
    currency: 'avax',
  },
};

export const COINGECKO_SUPPORTED_CURRENCIES = new Set([
  'btc',
  'eth',
  'ltc',
  'bch',
  'bnb',
  'eos',
  'xrp',
  'xlm',
  'link',
  'dot',
  'yfi',
  'usd',
  'aed',
  'ars',
  'aud',
  'bdt',
  'bhd',
  'bmd',
  'brl',
  'cad',
  'chf',
  'clp',
  'cny',
  'czk',
  'dkk',
  'eur',
  'gbp',
  'hkd',
  'huf',
  'idr',
  'ils',
  'inr',
  'jpy',
  'krw',
  'kwd',
  'lkr',
  'mmk',
  'mxn',
  'myr',
  'ngn',
  'nok',
  'nzd',
  'php',
  'pkr',
  'pln',
  'rub',
  'sar',
  'sek',
  'sgd',
  'thb',
  'try',
  'twd',
  'uah',
  'vef',
  'vnd',
  'zar',
  'xdr',
  'xag',
  'xau',
  'bits',
  'sats',
]);
