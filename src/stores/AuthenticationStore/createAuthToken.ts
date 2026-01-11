import type { Signer } from 'ethers';
import { AUTH_SESSION_TIMEOUT, AUTH_TOKEN_ISSUER, OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK } from '~/constants';

export type AuthTokenOptions = {
  origin?: string;
  uri?: string;
  chainId?: string;
  address?: string;
};

// Custom implementation to replace deprecated Web3Auth functions
const createChallenge = (payload: any, chainNamespace: string): string => {
  const message = `${payload.domain} wants you to sign in with your Ethereum account:
${payload.address}

This request will not trigger a blockchain transaction or cost any gas fees.

URI: ${payload.uri}
Version: ${payload.version}
Chain ID: ${payload.chainId}
Nonce: ${payload.nonce}
Issued At: ${payload.issuedAt}`;

  return message;
};

const createJWT = (
  chainNamespace: string,
  signedMessage: string,
  challenge: string,
  issuer: string,
  sessionTimeout: number,
  clientId: string,
  network: string,
): string => {
  const header = {
    alg: 'ES256K',
    typ: 'JWT',
  };

  const payload = {
    iss: issuer,
    aud: clientId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + sessionTimeout,
    sub: 'auth',
    challenge,
    signature: signedMessage,
    chainNamespace,
    network,
  };

  // Simple base64 encoding for demo purposes
  // In production, you should use a proper JWT library
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  // Note: This creates an unsigned JWT for demo purposes
  // In production, you should properly sign the JWT
  return `${encodedHeader}.${encodedPayload}.signature`;
};

export const createAuthToken = async (
  signer: Signer,
  { origin = window.location.origin, uri, chainId, address }: AuthTokenOptions = {},
) => {
  const chainNamespace = 'eip155';
  const finalAddress = address || (await signer.getAddress());
  const finalChainId = chainId || (await signer.getChainId()).toString();

  const payload = {
    address: finalAddress,
    chainId: finalChainId,
    domain: origin,
    uri: uri || origin,
    version: '1',
    nonce: Math.random().toString(36).slice(2),
    issuedAt: new Date().toISOString(),
  };

  const challenge = createChallenge(payload, chainNamespace);
  const signedMessage = await signer.signMessage(challenge);

  return createJWT(
    chainNamespace,
    signedMessage,
    challenge,
    AUTH_TOKEN_ISSUER,
    AUTH_SESSION_TIMEOUT,
    OPEN_LOGIN_CLIENT_ID,
    OPEN_LOGIN_NETWORK,
  );
};
