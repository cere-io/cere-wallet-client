import { createTheme as createMuiTheme, alpha, Theme as MuiTheme } from '@mui/material/styles';

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

export const createTheme = (): Theme => {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#733BF5',
      },

      secondary: {
        main: '#2D5BFF',
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
          sizeSmall: {
            lineHeight: '18px',
          },
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

          grouped: {
            borderRadius: [30, '!important'],
            border: 'none',

            '&:not(:first-of-type)': {
              marginLeft: '4px',
            },

            '&:hover': {
              backgroundColor: alpha('#ECF0FF', 0.3),
            },

            '&.Mui-selected': {
              backgroundColor: '#ECF0FF',
              color: '#2D5BFF',

              '&:hover': {
                backgroundColor: alpha('#ECF0FF', 0.8),
              },
            },
          },
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

            '&.Mui-selected': {
              color: theme.palette.primary.main,

              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main,
              },
            },
          }),
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
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

      MuiListItemText: {
        defaultProps: {
          primaryTypographyProps: {
            variant: 'button',
          },
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
    },
  });

  return theme;
};
