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
  onRequestPermissions?: (request: PermissionRequest) => Promise<PermissionRequest>;
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

const getMissingPermissions = (all: Permission[], requested: PermissionRequest) => {
  const missingPermissions: PermissionRequest = { ...requested };

  for (const { parentCapability } of all) {
    delete missingPermissions[parentCapability];
  }

  return missingPermissions;
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
        res.result = getPermissions?.();
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

        res.result = null;
      }),

      wallet_requestPermissions: createAsyncMiddleware(async (req, res) => {
        const [request] = req.params as [PermissionRequest];
        const approvedPermissions = getPermissions?.() || [];
        const missingPermissions = getMissingPermissions(approvedPermissions, request);
        const allApproved = Object.keys(missingPermissions).length === 0;
        const approvedPermission = allApproved ? request : await onRequestPermissions?.(missingPermissions);
        const capabilities = Object.keys(approvedPermission ?? {});

        if (!capabilities.length) {
          res.error = {
            code: 4001,
            message: 'User denied the request.',
          };

          return;
        }

        res.result = capabilities.map<RequestedPermission>((parentCapability) => ({
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
