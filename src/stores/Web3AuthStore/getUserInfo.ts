import jwtDecode from 'jwt-decode';
import type { Auth0UserInfo } from '@toruslabs/customauth';
import type { UserInfo } from '@cere-wallet/communication';

import { OPEN_LOGIN_VERIFIER } from '~/constants';

export const getUserInfo = (idToken: string): UserInfo => {
  const { name, email, picture } = jwtDecode<Auth0UserInfo>(idToken);

  return {
    name,
    email,
    profileImage: picture,
    typeOfLogin: 'jwt',
    verifier: OPEN_LOGIN_VERIFIER,
    verifierId: email,
  };
};
