import '@mui/lab/themeAugmentation';
import { CSSProperties } from 'react';
import { createTheme as createMuiTheme, alpha, Theme as MuiTheme, PaletteColor, colors } from '@mui/material';
import { ContextWhiteLabel } from './types';

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
    whiteLabel: ContextWhiteLabel | undefined;
  }

  interface ThemeOptions {
    whiteLabel: ContextWhiteLabel | undefined;
  }
}

export type Theme = MuiTheme;
export type ThemeOptions = {
  whiteLabel: ContextWhiteLabel | undefined;
};

/** ******************************************************************************* **/
/** CERE Wallet design system see here                                              **/
/** https://www.figma.com/file/R1Jl2hJiiHzl5WNO5PKdQc/Cere-wallet?node-id=13%3A6213 **/
/** ******************************************************************************* **/

export const createTheme = ({ whiteLabel }: ThemeOptions): Theme => {
  const theme = createMuiTheme({
    whiteLabel: whiteLabel,
    palette: {
      neutral: {
        main: colors.grey[400],
        dark: colors.grey[500],
        light: '#F5F5F7',
        contrastText: '#FFFFFF',
      },

      primary: {
        main: '#733BF5',
        light: '#F5F1FE',
      },

      secondary: {
        main: '#2D5BFF',
      },

      success: {
        main: '#28B411',
      },

      error: {
        main: '#ED2121',
        light: '#FFF2F2',
      },

      text: {
        primary: '#131B32',
        secondary: '#717684',
        caption: '#A1A4AD',
      },
      divider: '#E7E8EB',
    },

    typography: {
      fontFamily: '"Lexend", sans-serif',
      fontWeightBold: 700,
      fontWeightSemibold: 600,
      fontWeightMedium: 500,
      fontWeightRegular: 400,
      fontWeightLight: 300,

      button: {
        textTransform: 'none',
        fontWeight: '600',
      },

      h1: {
        fontSize: '2rem', // 32px
        lineHeight: '2.5rem', // 40px
        fontWeight: 700,
      },

      h2: {
        fontSize: '1.75rem', // 28px
        lineHeight: '2.25rem', // 36px
        fontWeight: 700,
      },

      h3: {
        fontSize: '1.5rem', // 24px,
        lineHeight: '2rem', // 32px,
        fontWeight: 700,
      },

      h4: {
        fontSize: '1.25rem', // 20px,
        lineHeight: '1.625rem', // 26px,
        fontWeight: 700,
      },

      subtitle1: {
        fontSize: '1rem', // 16px,
        lineHeight: '1.5rem', // 24px,
        fontWeight: 600,
      },

      subtitle2: {
        fontSize: '0.875rem', // 14px,
        lineHeight: '1.375rem', // 14px,
        fontWeight: 600,
      },

      body1: {
        fontSize: '1rem', // 16px,
        lineHeight: '1.5rem', // 24px,
      },

      body2: {
        fontSize: '0.875rem', // 14px,
        lineHeight: '1.375rem', // 14px,
      },

      caption: {
        fontSize: '0.75rem', // 12px,
        lineHeight: '1rem', // 16px,
      },

      overline: {
        fontSize: '0.625rem', // 10px,
        lineHeight: '1rem', // 16px,
        textTransform: 'uppercase',
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'transparent',
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
        },

        styleOverrides: {
          contained: {
            borderRadius: 30,
          },

          outlined: {
            borderRadius: 30,
          },

          text: {
            borderRadius: 30,
          },

          containedInherit: ({ theme }) => ({
            backgroundColor: theme.palette.grey[100],
          }),

          sizeLarge: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(16),
            paddingLeft: 32,
            paddingRight: 32,
            paddingTop: 10,
            paddingBottom: 10,
          }),

          sizeMedium: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(14),
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 8,
            paddingBottom: 8,
          }),

          sizeSmall: ({ theme }) => ({
            fontSize: theme.typography.pxToRem(12),
            lineHeight: theme.typography.pxToRem(18),
            paddingLeft: 14,
            paddingRight: 14,
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
            padding: 4,
            borderRadius: 30,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.palette.divider,
          }),

          grouped: ({ theme }) => ({
            borderRadius: 30,
            border: 'none',

            '&:not(:first-of-type)': {
              marginLeft: 4,
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
            },

            '&:not(:last-of-type)': {
              borderTopRightRadius: 30,
              borderBottomRightRadius: 30,
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
            height: 48,
            borderRadius: 30,

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
            backgroundColor: theme.palette.grey[100],
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
            padding: whiteLabel?.backgroundImage ? theme.spacing(0, 0) : theme.spacing(2, 3),
            margin: whiteLabel?.backgroundImage ? 'auto' : 'inherit',
            [theme.breakpoints.down('sm')]: {
              padding: whiteLabel?.backgroundImage ? theme.spacing(0, 0) : theme.spacing(2, 1),
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
            borderColor: whiteLabel?.backgroundImage ? 'rgba(255, 255, 255, 0.23)' : theme.palette.divider,
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
