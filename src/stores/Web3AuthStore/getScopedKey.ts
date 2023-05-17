import { subkey } from '@toruslabs/openlogin-subkey';
import { OPEN_LOGIN_CLIENT_ID } from '~/constants';

export const getScopedKey = (key: string) => {
  const scopedKey = subkey(key.padStart(64, '0'), Buffer.from(OPEN_LOGIN_CLIENT_ID, 'base64'));

  return scopedKey.padStart(64, '0');
};
