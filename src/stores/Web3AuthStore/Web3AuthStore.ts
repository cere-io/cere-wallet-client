import { Wallet as PrivateKeySigner } from 'ethers';
import { makeAutoObservable } from 'mobx';
import Torus from '@toruslabs/torus.js';
import { NodeDetailManager } from '@toruslabs/fetch-node-details';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { Wallet } from '../types';
import { getUserInfo } from './getUserInfo';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from './getScopedKey';
import { createAuthToken } from '../AuthenticationStore';
import { getUserApplications } from '../ApplicationsStore';

export type Web3AuthStoreLoginParams = {
  idToken: string;
  checkMfa?: boolean;
  appId?: string;
};

type VerifierDetails = {
  verifier?: string;
  verifierId: string;
};

export class Web3AuthStore {
  private nodeDetailManager = new NodeDetailManager({
    network: OPEN_LOGIN_NETWORK,
  });

  private auth = new Torus({
    enableOneKey: true,
    network: OPEN_LOGIN_NETWORK,
    clientId: OPEN_LOGIN_CLIENT_ID,
  });

  constructor(private wallet: Wallet, private sessionStore: SessionStore) {
    makeAutoObservable(this);
  }

  private async getNodeDetails({ verifierId, verifier = OPEN_LOGIN_VERIFIER }: VerifierDetails) {
    return this.nodeDetailManager.getNodeDetails({ verifier, verifierId });
  }

  async isMfaEnabled({ verifierId, verifier = OPEN_LOGIN_VERIFIER }: VerifierDetails) {
    const { torusNodeEndpoints, torusNodePub } = await this.getNodeDetails({ verifier, verifierId });

    const { metadata } = await this.auth.getUserTypeAndAddress(torusNodeEndpoints, torusNodePub, {
      verifier,
      verifierId,
    });

    return !!metadata.upgraded;
  }

  async getUserApps(privateKey: string) {
    const signer = new PrivateKeySigner(privateKey);

    const authToken = await createAuthToken(signer, { chainId: this.wallet.network?.chainId });

    return getUserApplications({ address: signer.address }, authToken);
  }

  async login({ idToken, appId, checkMfa = true }: Web3AuthStoreLoginParams) {
    const userInfo = getUserInfo(idToken);
    const isMfa = checkMfa ? await this.isMfaEnabled(userInfo) : false;

    if (isMfa) {
      throw new Error(`MFA is enabled for the account (${userInfo.email})`);
    }

    const { torusNodeEndpoints, torusIndexes } = await this.getNodeDetails(userInfo);
    const { metadata, finalKeyData, oAuthKeyData } = await this.auth.retrieveShares(
      torusNodeEndpoints,
      torusIndexes,
      userInfo.verifier,
      {
        verifier_id: userInfo.verifierId,
      },
      idToken,
    );

    if (metadata.upgraded) {
      throw new Error(`MFA is enabled for the account (${userInfo.email})`);
    }

    const privKey = finalKeyData.privKey || oAuthKeyData.privKey;

    if (!privKey) {
      throw new Error(`Unable to get private key for the account (${userInfo.email})`);
    }

    const pnpPrivKey = getScopedKey(privKey);
    const [pnpUserApps, coreKitUserApps] = await Promise.all([this.getUserApps(pnpPrivKey), this.getUserApps(privKey)]);
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

    return userInfo;
  }
}
