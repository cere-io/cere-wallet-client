import { createScaffoldMiddleware, createAsyncMiddleware, JsonRpcRequest } from 'json-rpc-engine';

import { Engine } from './engine';

export type PermissionCaveat = {
  type: string;
  value: any;
};

export type Permission = {
  invoker: string;
  parentCapability: string;
  caveats: PermissionCaveat[];
};

export type PermissionRequest = {
  [methodName: Permission['parentCapability']]: {
    [caveatName: PermissionCaveat['type']]: PermissionCaveat['value'];
  };
};

export type PermissionRevokeRequest = PermissionRequest;

export type RequestedPermission = {
  parentCapability: string;
  date?: number;
};

export type PermissionsEngineOptions = {
  getPermissions?: () => Permission[];
  onRequestPermissions?: (request: PermissionRequest) => Promise<boolean>;
  onRevokePermissions?: (request: PermissionRequest) => Promise<void>;
};

/**
 * Check if the request has the necessary permissions.
 *
 * TODO: This is a very simple implementation and can be extended to support caveats in future.
 */
const checkPermissions = ({ method }: JsonRpcRequest<unknown>, permissions: Permission[]) => {
  const permission = permissions.find((permission) => permission.parentCapability === method);

  return !!permission;
};

/**
 * Create a new permissions engine.
 * This engine will check if the request has the necessary permissions and if not, it will call the approve engine.
 *
 * @see https://eips.ethereum.org/EIPS/eip-2255
 */
export const createPermissionsEngine = (
  { getPermissions, onRequestPermissions, onRevokePermissions }: PermissionsEngineOptions,
  approveEngine: Engine,
) => {
  const engine = new Engine();
  const approveMiddleware = approveEngine.asMiddleware();

  engine.push(
    createScaffoldMiddleware({
      wallet_getPermissions: createAsyncMiddleware(async (req, res) => {
        res.result = await getPermissions?.();
      }),

      /**
       * Revoke the permissions.
       * This method is not part of the EIP-2255 but it is useful to revoke the permissions.
       *
       * @see https://github.com/MetaMask/metamask-improvement-proposals/blob/main/MIPs/mip-2.md
       */
      wallet_revokePermissions: createAsyncMiddleware(async (req, res) => {
        const [request] = req.params as [PermissionRevokeRequest];

        await onRevokePermissions?.(request);

        res.result = getPermissions?.() || [];
      }),

      wallet_requestPermissions: createAsyncMiddleware(async (req, res) => {
        const [request] = req.params as [PermissionRequest];
        const isApproved = await onRequestPermissions?.(request);

        if (!isApproved) {
          res.error = {
            code: 4001,
            message: 'User denied the request.',
          };

          return;
        }

        const permmisions = getPermissions?.() || [];

        res.result = permmisions.map<RequestedPermission>(({ parentCapability }) => ({
          parentCapability,
          date: Date.now(),
        }));
      }),
    }),
  );

  engine.push(async (req, res, next, end) => {
    const permissions = getPermissions?.() || [];

    if (checkPermissions(req, permissions)) {
      return next();
    }

    approveMiddleware(req, res, next, end);
  });

  return engine;
};
