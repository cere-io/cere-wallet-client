import { makeAutoObservable } from 'mobx';
import Torus, { TorusCtorOptions } from '@toruslabs/torus.js';
import { NodeDetailManager } from '@toruslabs/fetch-node-details';

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

const authNetwork = OPEN_LOGIN_NETWORK as TorusCtorOptions['network'];

export class Web3AuthStore {
  private nodeDetailManager = new NodeDetailManager({
    network: authNetwork,
  });

  private auth = new Torus({
    enableOneKey: true,
    network: authNetwork,
    clientId: OPEN_LOGIN_CLIENT_ID,
  });

  constructor(private sessionStore: SessionStore) {
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

  async login({ idToken, checkMfa = true }: Web3AuthStoreLoginParams) {
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

    await this.sessionStore.createSession({
      userInfo,
      privateKey: getScopedKey(privKey),
    });

    return userInfo;
  }
}
