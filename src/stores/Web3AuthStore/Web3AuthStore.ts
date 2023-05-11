import { makeAutoObservable } from 'mobx';
import CustomAuth, { CustomAuthArgs } from '@toruslabs/customauth';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK } from '~/constants';
import { getUserInfo } from './getUserInfo';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from './getScopedKey';

export type Web3AuthStoreLoginParams = {
  idToken: string;
};

export class Web3AuthStore {
  private auth = new CustomAuth({
    enableOneKey: true,
    baseUrl: window.location.origin,
    network: OPEN_LOGIN_NETWORK as CustomAuthArgs['network'],
    web3AuthClientId: OPEN_LOGIN_CLIENT_ID,
  });

  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);
  }

  async login({ idToken }: Web3AuthStoreLoginParams) {
    const userInfo = getUserInfo(idToken);
    const { privateKey } = await this.auth.getTorusKey(
      userInfo.verifier,
      userInfo.verifierId,
      {
        verifier_id: userInfo.verifierId,
      },
      idToken,
    );

    await this.sessionStore.createSession({
      userInfo,
      privateKey: getScopedKey(privateKey),
    });

    return userInfo;
  }
}
