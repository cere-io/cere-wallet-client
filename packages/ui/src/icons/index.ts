/**
 * Export only required set of icon from MUI, so we know what is used from the library and what is not.
 * Add `*Icon` to the icon component name
 */

export {
  Apps as AppsIcon,
  MonetizationOn as MonetizationOnIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  QrCodeScanner as QrCodeScannerIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

export type { IconProps } from '@mui/material';

export * from './CereIcon';
export * from './MaticIcon';
