import { makeAutoObservable } from 'mobx';
import { getIFrameOrigin } from '@cere-wallet/communication';
import { Permission, PermissionRequest, PermissionRevokeRequest } from '@cere-wallet/wallet-engine';

export type PermissionsStoreOptions = {};

export class PermissionsStore {
  private requestedPermissions: PermissionRequest = {};

  constructor(private options: PermissionsStoreOptions = {}) {
    makeAutoObservable(this);
  }

  get permissions(): Permission[] {
    const capabilities = Object.keys(this.requestedPermissions);

    return capabilities.map((parentCapability) => {
      const caveats = Object.entries(this.requestedPermissions[parentCapability]).map(([type, value]) => ({
        type,
        value,
      }));

      return {
        parentCapability,
        caveats,
        invoker: getIFrameOrigin(),
      };
    });
  }

  async requestPermissions(request: PermissionRequest) {
    this.requestedPermissions = { ...this.requestedPermissions, ...request };

    return true;
  }

  async revokePermissions(request: PermissionRevokeRequest) {
    for (const method in request) {
      delete this.requestedPermissions[method];
    }
  }
}
