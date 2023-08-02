import '@fontsource/lexend';
import { useMemo, PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider, GlobalStyles } from '@mui/material';
import { createTheme } from './theme';
import { BannerPlace } from './components';

export type UIProviderProps = PropsWithChildren<{
  transparentBody?: boolean;
  whiteLabel?: Record<string, string | number>;
}>;

export const UIProvider = ({ children, transparentBody }: UIProviderProps) => {
  const theme = useMemo(() => createTheme({ transparentBody }), [transparentBody]);

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
