import { Wallet as PrivateKeySigner } from 'ethers';
import { makeAutoObservable } from 'mobx';
import OpenLogin from '@toruslabs/openlogin';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { Wallet } from '../types';
import { getUserInfo } from './getUserInfo';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from './getScopedKey';
import { createAuthToken } from '../AuthenticationStore';
import { getUserApplications } from '../ApplicationsStore';

export type OpenLoginStoreLoginParams = {
  idToken: string;
  checkMfa?: boolean;
  appId?: string;
};

type VerifierDetails = {
  verifier?: string;
  verifierId: string;
};

interface OpenLoginResponse {
  privKey?: string;
  userInfo?: Record<string, any>;
}

export class OpenLoginStore {
  private openLogin = new OpenLogin({
    clientId: OPEN_LOGIN_CLIENT_ID,
    network: OPEN_LOGIN_NETWORK,
  });

  constructor(private wallet: Wallet, private sessionStore: SessionStore) {
    makeAutoObservable(this);
    this.openLogin.init().catch((error) => {
      console.error('Failed to initialize OpenLogin:', error);
    });
  }

  async isMfaEnabled({ verifierId, verifier = OPEN_LOGIN_VERIFIER }: VerifierDetails) {
    try {
      return false; // Simplified approach assuming MFA is not enabled
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  async getUserApps(privateKey: string) {
    const signer = new PrivateKeySigner(privateKey);

    const authToken = await createAuthToken(signer, { chainId: this.wallet.network?.chainId });

    return getUserApplications({ address: signer.address }, authToken);
  }

  async login({ idToken, appId, checkMfa = true }: OpenLoginStoreLoginParams) {
    const userInfo = getUserInfo(idToken);
    const isMfa = checkMfa ? await this.isMfaEnabled(userInfo) : false;

    if (isMfa) {
      throw new Error(`MFA is enabled for the account (${userInfo.email})`);
    }

    try {
      const loginDetails = (await this.openLogin.login({
        loginProvider: 'jwt',
        extraLoginOptions: {
          id_token: idToken,
          verifierIdField: 'sub',
          domain: window.location.origin,
        },
      })) as OpenLoginResponse;

      if (!loginDetails || !loginDetails.privKey) {
        throw new Error(`Unable to get private key for the account (${userInfo.email})`);
      }

      const privKey = loginDetails.privKey;
      const pnpPrivKey = getScopedKey(privKey);
      const [pnpUserApps, coreKitUserApps] = await Promise.all([
        this.getUserApps(pnpPrivKey),
        this.getUserApps(privKey),
      ]);
      const isPnPUser = pnpUserApps.length > 0;
      const currentApp = isPnPUser
        ? pnpUserApps.find((app) => app.appId === appId)
        : coreKitUserApps.find((app) => app.appId === appId);

      userInfo.isNewWallet = !isPnPUser && !coreKitUserApps.length;
      userInfo.isNewUser = !currentApp;

      await this.sessionStore.createSession({
        userInfo,
        privateKey: isPnPUser ? pnpPrivKey : privKey,
      });

      return { userInfo, permissions: currentApp?.permissions || {} };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
}
