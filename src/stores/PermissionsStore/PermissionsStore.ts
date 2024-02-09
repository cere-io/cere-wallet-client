import { makeAutoObservable } from 'mobx';
import { getIFrameOrigin } from '@cere-wallet/communication';
import { Permission, PermissionRequest, PermissionRevokeRequest } from '@cere-wallet/wallet-engine';

export type PermissionsStoreOptions = {};

export class PermissionsStore {
  private currentPermissions: Omit<Permission, 'invoker'>[] = [];

  constructor(private options: PermissionsStoreOptions = {}) {
    makeAutoObservable(this);
  }

  get permissions(): Permission[] {
    return this.currentPermissions.map((permission) => ({
      ...permission,
      invoker: getIFrameOrigin(),
    }));
  }

  async approvePermissions(request: PermissionRequest) {
    return true;
  }

  async revokePermissions(request: PermissionRevokeRequest) {}
}
