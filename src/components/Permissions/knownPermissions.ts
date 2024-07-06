import { ALLOWED_WALLET_PERMISSIONS } from '~/constants';

export type AllowedPermission = (typeof ALLOWED_WALLET_PERMISSIONS)[number];
export type PermissionMeta = {
  title: string;
  description: string;
};

export const knownPermissions: Record<AllowedPermission, PermissionMeta> = {
  personal_sign: {
    title: 'Sign message (EVM)',
    description: 'Allow the app to sign data on your behalf in background.',
  },

  ed25519_signRaw: {
    title: 'Sign message (Cere Network)',
    description: 'Allow the app to sign data on your behalf in background.',
  },

  solana_signMessage: {
    title: 'Sign message (Solana)',
    description: 'Allow the app to sign data on your behalf in background.',
  },
};

export const defaultDescription = 'No description available';
