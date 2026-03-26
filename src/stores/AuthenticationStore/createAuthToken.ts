import type { Signer } from 'ethers';
import { signChallenge, verifySignedChallenge } from '@web3auth/base';
import { AUTH_SESSION_TIMEOUT, AUTH_TOKEN_ISSUER, OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK } from '~/constants';

export type AuthTokenOptions = {
  origin?: string;
  uri?: string;
  chainId?: string;
  address?: string;
};

export const createAuthToken = async (
  signer: Signer,
  { origin = window.location.origin, uri, chainId, address }: AuthTokenOptions = {},
) => {
  const chainNamespace = 'eip155';
  const finalAddress = address || signer.getAddress();
  const rawChainId = chainId || signer.getChainId();
  const payload = {
    address: await finalAddress,
    chainId: Number(await rawChainId),
    domain: origin,
    uri: uri || origin,
    version: '1',
    nonce: Math.random().toString(36).slice(2),
    issuedAt: new Date().toISOString(),
  };
  console.log('[createAuthToken] payload', payload);
  console.log('[createAuthToken] constants', { AUTH_TOKEN_ISSUER, OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK });

  const challenge = await signChallenge(payload, chainNamespace);
  console.log('[createAuthToken] challenge OK', challenge);

  const signedMessage = await signer.signMessage(challenge);
  console.log('[createAuthToken] signedMessage OK');

  console.log('[createAuthToken] calling verifySignedChallenge with', {
    chainNamespace,
    issuer: AUTH_TOKEN_ISSUER,
    timeout: AUTH_SESSION_TIMEOUT,
    clientId: OPEN_LOGIN_CLIENT_ID,
    network: OPEN_LOGIN_NETWORK,
    audience: window.location.hostname,
  });

  return verifySignedChallenge(
    chainNamespace,
    signedMessage,
    challenge,
    AUTH_TOKEN_ISSUER,
    AUTH_SESSION_TIMEOUT,
    OPEN_LOGIN_CLIENT_ID,
    OPEN_LOGIN_NETWORK as any,
  );
};
