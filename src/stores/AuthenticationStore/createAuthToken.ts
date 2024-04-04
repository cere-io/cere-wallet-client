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
  const finalChainId = chainId || signer.getChainId();

  const payload = {
    address: await finalAddress,
    chainId: await finalChainId,
    domain: origin,
    uri: uri || origin,
    version: '1',
    nonce: Math.random().toString(36).slice(2),
    issuedAt: new Date().toISOString(),
  };

  const challenge = await signChallenge(payload, chainNamespace);
  const signedMessage = await signer.signMessage(challenge);

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
