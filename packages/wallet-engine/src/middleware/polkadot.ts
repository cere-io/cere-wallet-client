import { createScaffoldMiddleware } from 'json-rpc-engine';

export type PolkadotMiddlewareOptions = {
  getPrivateKey: () => string;
};

export const createPolkadotMiddleware = (options: PolkadotMiddlewareOptions) => {
  return createScaffoldMiddleware({}); // TODO: implement
};
