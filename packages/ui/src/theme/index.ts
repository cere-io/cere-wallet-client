import '@mui/lab/themeAugmentation';
import { CSSProperties } from 'react';
import { createTheme as createMuiTheme, alpha, Theme as MuiTheme, PaletteColor, colors } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: PaletteColor;
  }

  interface PaletteOptions {
    neutral: PaletteColor;
  }
}

declare module '@mui/material/styles/createPalette' {
  interface TypeText {
    caption: string;
  }
}

declare module '@mui/material/IconButton' {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
}

declare module '@mui/material/Alert' {
  interface AlertPropsColorOverrides {
    neutral: true;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariantsOptions {
    fontWeightSemibold?: CSSProperties['fontWeight'];
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h5: false;
    h6: false;
  }
}

declare module '@mui/material/styles' {
  interface Theme {
    whiteLabel: {
      backgroundImage: string;
      mainColor?: string;
    };
    isGame: boolean;
  }

  interface ThemeOptions {
    whiteLabel: {
      backgroundImage: string;
      mainColor?: string;
    };
    isGame: boolean;
  }
}

export type Theme = MuiTheme;
export type ThemeOptions = {
  whiteLabel?: any; // TODO: figure out the type later
};

/** ******************************************************************************* **/
/** CERE Wallet design system see here                                              **/
/** https://www.figma.com/file/R1Jl2hJiiHzl5WNO5PKdQc/Cere-wallet?node-id=13%3A6213 **/
/** ******************************************************************************* **/

export const createTheme = ({ whiteLabel, isGame }: any = {}): Theme => {
  const theme = createMuiTheme({
    isGame: isGame,
    whiteLabel: {
      backgroundImage: whiteLabel?.backgroundImage,
      mainColor: whiteLabel?.mainColor,
    },
    palette: {
      mode: 'light',
      background: {
        default: '#FAFAFB',
        paper: '#FFFFFF',
      },
      neutral: {
        main: '#9CA0A8',
        dark: '#6B7080',
        light: '#F4F4F7',
        contrastText: '#FFFFFF',
      },

      primary: {
        main: '#5B2FE0',
        light: '#F2EEFE',
        dark: '#3F1FB5',
      },

      secondary: {
        main: '#0F172A',
      },

      success: {
        main: '#0FA958',
        light: '#E8F8EE',
      },

      warning: {
        main: '#D97706',
        light: '#FEF6E7',
      },

      error: {
        main: '#DC2626',
        light: '#FEF2F2',
      },

      text: {
        primary: '#0B0F1C',
        secondary: '#5B6172',
        caption: '#9097A4',
      },
      divider: '#ECEDF0',
    },

    typography: {
      fontFamily: '"Inter Variable", "Inter", system-ui, -apple-system, sans-serif',
      fontWeightBold: 700,
      fontWeightSemibold: 600,
      fontWeightMedium: 500,
      fontWeightRegular: 400,
      fontWeightLight: 300,

      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },

      h1: {
        fontSize: '2rem',
        lineHeight: '2.25rem',
        fontWeight: 650,
        letterSpacing: '-0.035em',
      },

      h2: {
        fontSize: '1.75rem',
        lineHeight: '2rem',
        fontWeight: 650,
        letterSpacing: '-0.03em',
      },

      h3: {
        fontSize: '1.5rem',
        lineHeight: '1.75rem',
        fontWeight: 650,
        letterSpacing: '-0.025em',
      },

      h4: {
        fontSize: '1.25rem',
        lineHeight: '1.5rem',
        fontWeight: 650,
        letterSpacing: '-0.02em',
      },

      subtitle1: {
        fontSize: '1rem',
        lineHeight: '1.375rem',
        fontWeight: 600,
        letterSpacing: '-0.015em',
      },

      subtitle2: {
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },

      body1: {
        fontSize: '1rem',
        lineHeight: '1.4',
        letterSpacing: '-0.011em',
      },

      body2: {
        fontSize: '0.875rem',
        lineHeight: '1.4',
        letterSpacing: '-0.008em',
      },

      caption: {
        fontSize: '0.75rem',
        lineHeight: '1rem',
        letterSpacing: '-0.005em',
      },

      overline: {
        fontSize: '0.625rem',
        lineHeight: '1rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontWeight: 600,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#FAFAFB',
            backgroundImage:
              'radial-gradient(1200px 480px at 80% -10%, rgba(91,47,224,0.06), transparent 60%), radial-gradient(800px 400px at -10% 110%, rgba(15,23,42,0.04), transparent 60%)',
            backgroundAttachment: 'fixed',
            color: '#0B0F1C',
            fontFeatureSettings: '"cv11", "ss01", "ss03"',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
          },
        },
      },
      MuiLink: {
        defaultProps: {
          underline: 'none',
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
          disableRipple: false,
        },

        styleOverrides: {
          root: ({ theme, ownerState: props }) => {
            const color = props.color === 'inherit' ? undefined : theme.palette[props.color || 'primary'];
            const disabledColor = color && alpha(color.main, theme.palette.action.disabledOpacity);
            const textColor = color && color.contrastText;

            return {
              transition: 'transform 120ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease, opacity 160ms ease',
              willChange: 'transform',
              '&:active': {
                transform: 'translateY(0.5px) scale(0.985)',
              },
              ...(color && {
                '&.Mui-disabled': {
                  borderColor: disabledColor,
                  backgroundColor: props.variant === 'contained' ? disabledColor : undefined,
                  color: props.variant === 'contained' ? textColor : color?.main,
                },
              }),
            };
          },

          contained: ({ theme, ownerState: props }) => {
            const color = props.color === 'inherit' ? undefined : theme.palette[props.color || 'primary'];
            return {
              backgroundColor: isGame ? '#F32758' : undefined,
              borderRadius: isGame ? 4 : 10,
              boxShadow: 'none',
              ...(whiteLabel?.mainColor && {
                backgroundColor: whiteLabel.mainColor,
              }),
              '&:hover': {
                boxShadow: color ? `0 6px 18px -6px ${alpha(color.main, 0.45)}` : undefined,
                transform: 'translateY(-0.5px)',
                ...(whiteLabel?.mainColor && {
                  backgroundColor: whiteLabel.mainColor,
                  opacity: 0.9,
                }),
              },
            };
          },

          outlined: ({ theme, ownerState: props }) => {
            const color = props.color === 'inherit' ? undefined : theme.palette[props.color || 'primary'];
            return {
              borderRadius: isGame ? 4 : 10,
              borderWidth: 1.5,
              '&:hover': {
                borderWidth: 1.5,
                backgroundColor: color && alpha(color.main, 0.06),
                transform: 'translateY(-0.5px)',
              },
            };
          },

          text: {
            borderRadius: isGame ? 4 : 10,
          },

          containedInherit: ({ theme }) => ({
            backgroundColor: theme.palette.grey[100],
            '&:hover': {
              backgroundColor: theme.palette.grey[200],
            },
          }),

          sizeLarge: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(15),
            lineHeight: theme.typography.pxToRem(22),
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 11,
            paddingBottom: 11,
          }),

          sizeMedium: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(14),
            lineHeight: theme.typography.pxToRem(20),
            paddingLeft: 18,
            paddingRight: 18,
            paddingTop: 8,
            paddingBottom: 8,
          }),

          sizeSmall: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(12),
            lineHeight: theme.typography.pxToRem(16),
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 6,
            paddingBottom: 6,
          }),

          iconSizeLarge: ({ theme }) => ({
            '& .MuiSvgIcon-root': {
              fontSize: theme.typography.pxToRem(18),
            },
          }),

          iconSizeMedium: ({ theme }) => ({
            '& .MuiSvgIcon-root': {
              fontSize: theme.typography.pxToRem(16),
            },
          }),

          iconSizeSmall: ({ theme }) => ({
            '& .MuiSvgIcon-root': {
              fontSize: theme.typography.pxToRem(14),
            },
          }),
        },
      },

      MuiLoadingButton: {
        styleOverrides: {
          root: ({ theme, ownerState: props }) => {
            const color = props.color === 'inherit' ? undefined : theme.palette[props.color || 'primary'];
            const disabledColor = color && alpha(color.main, theme.palette.action.disabledOpacity);
            const textColor = color && color.contrastText;

            return (
              color && {
                '&.Mui-disabled': {
                  borderColor: disabledColor,
                  backgroundColor: props.variant === 'contained' ? disabledColor : undefined,
                },

                '& .MuiLoadingButton-loadingIndicator': {
                  color: props.variant === 'contained' ? textColor : color?.main,
                },
              }
            );
          },
        },
      },

      MuiToggleButton: {
        styleOverrides: {
          sizeSmall: ({ theme }) => ({
            lineHeight: theme.typography.pxToRem(16),
          }),

          sizeMedium: ({ theme }) => ({
            lineHeight: theme.typography.pxToRem(16),
          }),
        },
      },

      MuiToggleButtonGroup: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: 3,
            borderRadius: 10,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.palette.divider,
          }),

          grouped: ({ theme }) => ({
            borderRadius: 8,
            border: 'none',

            '&:not(:first-of-type)': {
              marginLeft: 3,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            },

            '&:not(:last-of-type)': {
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            },
          }),
        },
      },

      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: 64,

            '& .MuiTab-iconWrapper:not(.Mui-selected *)': {
              color: theme.palette.text.secondary,
            },
          }),

          textColorPrimary: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: ({ theme }) => ({
            height: 44,
            borderRadius: 8,

            '& .MuiListItemIcon-root': {
              color: theme.palette.text.secondary,
            },

            '&.Mui-selected': {
              color: theme.palette.primary.main,

              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main,
              },
            },

            '& .MuiListItemText-primary': {
              ...theme.typography.button,
            },
          }),
        },
      },

      MuiListItem: {
        styleOverrides: {
          dense: ({ theme }) => ({
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),

            'html & .MuiListItemIcon-root': {
              minWidth: 44,
            },
          }),
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: ({ theme, ownerState }) => ({
            minWidth: 52,
            color: theme.palette.text.primary,
          }),
        },
      },

      MuiListItemAvatar: {
        styleOverrides: {
          root: ({ theme }) => ({
            minWidth: 52,
          }),
        },
      },

      MuiListItemText: {
        defaultProps: {
          primaryTypographyProps: {
            color: 'text.primary',
            fontWeight: 'bold',
          },
        },

        styleOverrides: {
          root: {
            '& .MuiTypography-root': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },

          dense: ({ theme }) => ({
            '& .MuiListItemText-secondary': {
              ...theme.typography.caption,
            },
          }),
        },
      },

      MuiCard: {
        defaultProps: {
          elevation: 0,
        },

        styleOverrides: {
          root: ({ theme }) => ({
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.palette.divider,
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            boxShadow:
              '0 1px 0 rgba(11, 15, 28, 0.02), 0 8px 24px -12px rgba(11, 15, 28, 0.06)',
            transition: 'box-shadow 200ms ease, transform 200ms ease',
          }),
        },
      },

      MuiCardHeader: {
        defaultProps: {
          titleTypographyProps: {
            variant: 'body1',
            fontWeight: 'bold',
            noWrap: true,
            textOverflow: 'ellipsis',
          },

          subheaderTypographyProps: {
            variant: 'caption',
            noWrap: true,
            textOverflow: 'ellipsis',
          },
        },

        styleOverrides: {
          root: ({ theme }) => ({
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: theme.palette.divider,
            backgroundColor: 'transparent',
          }),

          avatar: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            padding: 4,
            borderRadius: '50%',
          }),

          content: {
            overflow: 'hidden',
          },

          action: ({ theme }) => ({
            alignSelf: 'center',
            margin: theme.spacing(0, 0, 0, 2),

            '& .MuiIconButton-root': {
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.palette.divider,
              backgroundColor: theme.palette.background.paper,
              width: 36,
              height: 36,
            },

            '& .MuiSvgIcon-root': {
              fontSize: theme.typography.pxToRem(20),
            },
          }),
        },
      },

      MuiAvatar: {
        styleOverrides: {
          fallback: {
            width: '85%',
            height: '85%',
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          sizeSmall: {
            height: 'auto',
          },

          labelSmall: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(12),
            lineHeight: theme.typography.pxToRem(20),
            padding: theme.spacing(0, 1.5),
          }),

          filled: ({ theme, ownerState: props }) => {
            const color = props.color === 'default' ? undefined : theme.palette[props.color || 'primary'].main;

            return {
              color,
              backgroundColor: color && alpha(color, 0.08),
              fontWeight: theme.typography.fontWeightBold,
            };
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(3, 3, 2, 3),
          }),
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: isGame ? theme.spacing(0, 0) : theme.spacing(2, 3),
            margin: isGame ? 'auto' : 'inherit',
            [theme.breakpoints.down('sm')]: {
              padding: isGame ? theme.spacing(0, 0) : theme.spacing(2, 1),
            },
          }),
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(2, 3),
          }),
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: ({ theme, ownerState: { variant, severity, color } }) => {
            const baseStyles = {
              padding: theme.spacing(1, 2),
            };

            if (color !== 'neutral') {
              return baseStyles;
            }

            if (variant === 'filled') {
              return {
                ...baseStyles,
                color: theme.palette.neutral.contrastText,
              };
            }

            if (variant === 'standard') {
              return {
                ...baseStyles,
                color: theme.palette.text.secondary,
                backgroundColor: theme.palette.neutral.light,
              };
            }

            if (variant === 'outlined') {
              return {
                ...baseStyles,
                borderColor: theme.palette.neutral.main,
              };
            }

            return baseStyles;
          },

          icon: ({ ownerState: { variant, color } }) =>
            variant !== 'filled' &&
            color === 'neutral' && {
              color: `inherit!important`,
            },
        },
      },

      MuiAccordion: {
        defaultProps: {
          elevation: 0,
        },

        styleOverrides: {
          root: {
            backgroundColor: 'transparent',

            '&:before': {
              display: 'none',
            },

            '&.Mui-expanded': {
              marginBottom: 0,
              marginTop: 0,

              minHeight: 'auto',
            },
          },

          gutters: ({ theme }) => ({
            padding: theme.spacing(1, 0),

            '&:first-of-type': {
              paddingTop: theme.spacing(2),
            },

            '&:last-of-type': {
              paddingBottom: theme.spacing(2),
            },
          }),

          rounded: {
            '&:first-of-type': {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },

            '&:last-of-type': {
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
            },
          },
        },
      },

      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: 'auto',
            alignItems: 'flex-start',

            '&.Mui-expanded': {
              minHeight: 'auto',
              margin: 0,
            },
          },

          content: ({ theme }) => ({
            margin: 0,

            '&.Mui-expanded': {
              margin: theme.spacing(0, 0, 1, 0),
            },
          }),
        },
      },

      MuiAccordionDetails: {
        styleOverrides: {
          root: ({ theme }) => ({
            paddingTop: 0,
            paddingBottom: 0,
          }),
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: isGame ? 'rgba(255, 255, 255, 0.23)' : theme.palette.divider,
            borderRadius: theme.typography.pxToRem(16),
          }),
        },
      },

      MuiMobileStepper: {
        styleOverrides: {
          dotActive: ({ theme }) => ({
            backgroundColor: theme.palette.text.primary,
          }),
        },
      },

      MuiSelect: {
        defaultProps: {
          MenuProps: {
            anchorOrigin: {
              horizontal: 'right',
              vertical: 'bottom',
            },
            transformOrigin: {
              vertical: -8,
              horizontal: 'right',
            },
          },
        },
      },
    },
  });

  return theme;
};
