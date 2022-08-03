import { useMemo, PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from './theme';

export type UIProviderProps = PropsWithChildren<{}>;

export const UIProvider = ({ children }: UIProviderProps) => {
  const theme = useMemo(() => createTheme(), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {children}
    </ThemeProvider>
  );
};
