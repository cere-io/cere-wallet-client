import { PropsWithChildren, useMemo } from 'react';
import '@fontsource/lexend';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { BannerPlace } from './components';
import { createTheme } from './theme';

export type UIProviderProps = PropsWithChildren<{
  transparentBody?: boolean;
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
