import { createTheme as createMuiTheme, alpha } from '@mui/material/styles';

export const createTheme = () => {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#8520E7',
      },

      secondary: {
        main: '#2D5BFF',
      },

      text: {
        secondary: '#717684',
      },
    },

    typography: {
      button: {
        textTransform: 'none',
        fontWeight: 'bold',
      },
    },

    components: {
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
            borderRadius: '30px',
          },
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
          root: {
            borderRadius: '30px',
            border: '1px solid #E7E8EB',
            padding: '4px',
          },

          grouped: {
            borderRadius: '30px!important',
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
    },
  });

  return theme;
};
