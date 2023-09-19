import { useTheme } from '@mui/material';

type WhiteLabelOptions = {
  brandColor: string;
  textColor: string;
  textSecondaryColor: string;
  textCaptionColor: string;
  linkColor: string;
  borderRadius: string;
  border: string;
  buttonTextColor: string;
  isGame: boolean;
  backgroundImage: {
    backgroundImage: string | 'none';
    backgroundRepeat: 'no-repeat';
    overflow: 'hidden';
    padding: string;
  };
};

export const useWhiteLabel = (): WhiteLabelOptions => {
  const { whiteLabel } = useTheme();

  return {
    // backgroundImage
    backgroundImage: {
      backgroundImage: whiteLabel?.backgroundImage ?? 'none',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden',
      padding: whiteLabel?.backgroundImage ? '0 20px' : '0',
    },
    // primary
    brandColor: whiteLabel?.brandColor ?? 'primary.main',
    // text
    textColor: whiteLabel?.textColor ?? 'text.primary',
    textSecondaryColor: whiteLabel?.textSecondaryColor ?? 'text.secondary',
    textCaptionColor: whiteLabel?.textCaptionColor ?? 'text.caption',
    // link
    linkColor: (whiteLabel?.linkColor || whiteLabel?.brandColor) ?? 'primary.main',
    // buttons
    borderRadius: whiteLabel?.borderRadius ?? '',
    border: whiteLabel?.border ?? '',
    buttonTextColor: whiteLabel?.buttonTextColor ?? '',
    // boolean
    isGame: whiteLabel?.isGame || false,
  };
};
