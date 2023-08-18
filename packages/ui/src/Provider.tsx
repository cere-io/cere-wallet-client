import '@fontsource/lexend';
import { useMemo, PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider, GlobalStyles } from '@mui/material';
import { ThemeOptions, createTheme } from './theme';
import { BannerPlace } from './components';

export type UIProviderProps = PropsWithChildren<
  ThemeOptions & {
    transparentBody?: boolean;
  }
>;

export const UIProvider = ({ children, transparentBody, whiteLabel }: UIProviderProps) => {
  const theme = useMemo(() => createTheme({ whiteLabel }), [whiteLabel]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BannerPlace placement="top" />

      {transparentBody && (
        <GlobalStyles
          styles={{
            body: {
              backgroundColor: 'transparent',
            },
          }}
        />
      )}

      {children}
      <BannerPlace placement="bottom" />
    </ThemeProvider>
  );
};
