import { createTheme as createMuiTheme, alpha, Theme as MuiTheme } from '@mui/material';

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

export type Theme = MuiTheme;
export type ThemeOptions = {};

export const createTheme = (options: ThemeOptions = {}): Theme => {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#733BF5',
      },

      secondary: {
        main: '#2D5BFF',
      },

      success: {
        main: '#28B411',
      },

      error: {
        main: '#ED2121',
      },

      text: {
        primary: '#131B32',
        secondary: '#717684',
        caption: '#A1A4AD',
      },

      divider: '#E7E8EB',
    },

    typography: {
      button: {
        textTransform: 'none',
        fontWeight: 'bold',
      },

      h4: {
        fontWeight: 'bold',
      },

      h5: {
        fontWeight: 'bold',
      },

      h6: {
        fontWeight: 'bold',
      },

      caption: {
        lineHeight: 1.5,
      },
    },

    components: {
      MuiLink: {
        defaultProps: {
          underline: 'none',
        },
      },

      MuiButtonBase: {
        styleOverrides: {
          root: {
            borderRadius: 30,
          },
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

          containedInherit: ({ theme }) => ({
            backgroundColor: theme.palette.grey[100],
          }),
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
            minHeight: '64px',

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
          }),
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.primary,
          }),
        },
      },

      MuiListItemText: {
        defaultProps: {
          primaryTypographyProps: {
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
    },
  });

  return theme;
};
