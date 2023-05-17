import { makeAutoObservable } from 'mobx';
import CustomAuth, { CustomAuthArgs } from '@toruslabs/customauth';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { getUserInfo } from './getUserInfo';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from './getScopedKey';

export type Web3AuthStoreLoginParams = {
  idToken: string;
  checkMfa?: boolean;
};

type VerifierDetails = {
  verifier?: string;
  verifierId: string;
};

export class Web3AuthStore {
  private auth = new CustomAuth({
    enableLogging: true,
    enableOneKey: true,
    baseUrl: window.location.origin,
    network: OPEN_LOGIN_NETWORK as CustomAuthArgs['network'],
    web3AuthClientId: OPEN_LOGIN_CLIENT_ID,
  });

  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);
  }

  async isMfaEnabled({ verifierId, verifier = OPEN_LOGIN_VERIFIER }: VerifierDetails) {
    const { torusNodeEndpoints, torusNodePub } = await this.auth.nodeDetailManager.getNodeDetails({
      verifier,
      verifierId,
    });

    const pubDetails = await this.auth.torus.getUserTypeAndAddress(
      torusNodeEndpoints,
      torusNodePub,
      { verifier, verifierId },
      true,
    );

    return !!pubDetails.upgraded;
  }

  async login({ idToken, checkMfa = true }: Web3AuthStoreLoginParams) {
    const userInfo = getUserInfo(idToken);
    const isMfa = checkMfa ? await this.isMfaEnabled(userInfo) : false;

    if (isMfa) {
      throw new Error(`MFA is enabled for the account (${userInfo.email})`);
    }

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
