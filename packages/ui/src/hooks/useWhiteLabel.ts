import { useTheme } from '@mui/material';

export const useWhiteLabel = () => {
  const { whiteLabel } = useTheme();

  return {
    // backgroundImage
    backgroundImage: {
      backgroundImage: whiteLabel?.backgroundImage ?? 'none',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden',
      padding: whiteLabel?.backgroundImage ? '0 20px' : '0',
    },
    // text
    text: {
      primary: whiteLabel?.palette?.text?.primary ?? 'text.primary',
      secondary: whiteLabel?.palette?.text?.secondary ?? 'text.secondary',
      caption: whiteLabel?.palette?.text?.caption ?? 'text.caption',
    },
    link: whiteLabel?.palette?.primary?.main ?? 'primary.main',
    // primary
    primary: {
      main: whiteLabel?.palette?.primary?.main ?? 'primary.main',
      light: whiteLabel?.palette?.primary?.light ?? 'primary.light',
    },
    // secondary
    secondary: {
      main: whiteLabel?.palette?.secondary?.main ?? 'secondary.main',
      light: whiteLabel?.palette?.secondary?.light ?? 'secondary.light',
    },
    // buttons
    buttons: {
      contained: {
        borderRadius: whiteLabel?.button?.contained?.borderRadius ?? '',
        backgroundColor: whiteLabel?.button?.contained?.backgroundColor ?? '',
      },
      outlined: {
        borderRadius: whiteLabel?.button?.outlined?.borderRadius ?? '',
        backgroundColor: whiteLabel?.button?.outlined?.backgroundColor ?? '',
        border: whiteLabel?.button?.outlined?.border ?? '',
      },
      text: {
        color: whiteLabel?.button?.text ?? '',
      },
    },
    textField: {
      enabled: {
        input: whiteLabel?.palette?.secondary?.main ?? 'primary.main',
        '& fieldset': {
          border: 'none',
        },
      },
      disabled: {
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: whiteLabel?.palette?.primary?.main ?? '',
        },
      },
    },
  };
};
