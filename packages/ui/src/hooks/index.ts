/**
 * Export only required set of hooks from MUI, so we know what is used from the library and what is not
 */

export { useTheme, useMediaQuery } from '@mui/material';

export * from './useIsMobile';
export * from './useWhiteLabel';
