import { OPEN_LOGIN_CLIENT_ID } from '~/constants';
import { keccak256 } from 'ethers/lib/utils';

export const getScopedKey = (key: string) => {
  // Simple implementation using ethers
  const paddedKey = key.padStart(64, '0');
  return keccak256(Buffer.from(`${paddedKey}${OPEN_LOGIN_CLIENT_ID}`)).slice(2);
};
