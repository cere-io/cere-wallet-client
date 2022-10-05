import { useMemo, PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider, GlobalStyles } from '@mui/material';
import { createTheme } from './theme';

export type UIProviderProps = PropsWithChildren<{
  transparentBody?: boolean;
}>;

export const UIProvider = ({ children, transparentBody }: UIProviderProps) => {
  const theme = useMemo(() => createTheme({ transparentBody }), [transparentBody]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

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
    </ThemeProvider>
  );
};
