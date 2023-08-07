import '@fontsource/lexend';
import { useMemo, PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider, GlobalStyles } from '@mui/material';
import { createTheme, ThemeOptions } from './theme';
import { BannerPlace } from './components';

export type UIProviderProps = PropsWithChildren<{
  transparentBody?: boolean;
  whiteLabel?: ThemeOptions;
}>;

export const UIProvider = ({ children, transparentBody, whiteLabel }: UIProviderProps) => {
  const theme = useMemo(() => createTheme({ whiteLabel }), [transparentBody]);

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
