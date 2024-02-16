import jwtDecode from 'jwt-decode';
import type { UserInfo } from '@cere-wallet/communication';

import { OPEN_LOGIN_VERIFIER } from '~/constants';

interface Auth0UserInfo {
  picture: string;
  email: string;
  name: string;
  sub: string;
  nickname: string;
}

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
