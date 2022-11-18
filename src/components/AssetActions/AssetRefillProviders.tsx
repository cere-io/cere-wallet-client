import { LogoRampCaptionIcon, LogoRampIcon } from '@cere-wallet/ui';
import { AssetPurchaseProviderProps } from './AssetDepositProvider';

export const ASSET_REFILL_PROVIDER_LIST: AssetPurchaseProviderProps[] = [
  {
    name: 'Ramp',
    logo: <LogoRampCaptionIcon sx={{ height: 24, width: 104 }} />,
    smallLogo: <LogoRampIcon />,
    payMethodList: ['Credit/Debit card', 'Apple pay', 'Bank transfer'],
    fees: '0.49%- 2.9%',
    limits: '5,000€/purchase, 20,000€/month',
    assetList: ['ETH', 'DAI', 'USDC', 'USDC'],
  },
  {
    name: 'bump',
    logo: <LogoRampCaptionIcon sx={{ height: 24, width: 104 }} />,
    smallLogo: <LogoRampIcon />,
    payMethodList: ['Bank transfer'],
    fees: '0.49%- 2.9%',
    limits: '5,000€/purchase, 20,000€/month',
    assetList: ['ETH', 'DAI', 'USDC', 'USDC'],
  },
  {
    name: 'tRamp',
    logo: <LogoRampCaptionIcon sx={{ height: 24, width: 104 }} />,
    smallLogo: <LogoRampIcon />,
    payMethodList: ['Credit/Debit card', 'Apple pay', 'Bank transfer'],
    fees: '0.49%- 2.9%',
    limits: '7,000€/purchase, 20,000€/month',
    assetList: ['ETH', 'DAI', 'TTD', 'WAT'],
  },
];
