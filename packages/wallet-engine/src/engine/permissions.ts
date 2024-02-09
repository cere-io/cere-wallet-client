import { createScaffoldMiddleware, createAsyncMiddleware, JsonRpcRequest } from 'json-rpc-engine';

import { Engine } from './engine';

export type PermissionsEngineOptions = {};

const checkPermissions = (req: JsonRpcRequest<unknown>) => {
  return false;
};

/**
 * Create a new permissions engine.
 * This engine will check if the request has the necessary permissions and if not, it will call the approve engine.
 *
 * @see https://eips.ethereum.org/EIPS/eip-2255
 */
export const createPermissionsEngine = (options: PermissionsEngineOptions = {}, approveEngine: Engine) => {
  const engine = new Engine();
  const approveMiddleware = approveEngine.asMiddleware();

  engine.push(
    createScaffoldMiddleware({
      wallet_getPermissions: createAsyncMiddleware(async (req, res) => {
        res.result = [];
      }),

      wallet_requestPermissions: createAsyncMiddleware(async (req, res) => {
        res.result = {};
      }),
    }),
  );

  engine.push(async (req, res, next, end) => {
    if (checkPermissions(req)) {
      return next();
    }

    approveMiddleware(req, res, next, end);
  });

  return engine;
};
