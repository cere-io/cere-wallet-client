import { getIFrameOrigin } from '@cere-wallet/communication';
import { Permission, PermissionRequest, PermissionRevokeRequest } from '@cere-wallet/wallet-engine';
import { SessionStore } from '../SessionStore';

export class PermissionsStore {
  constructor(private sessionStore: SessionStore) {}

  get permissions(): Permission[] {
    const permissions = this.sessionStore.getState<PermissionRequest>('permissions') || {};
    const capabilities = Object.keys(permissions);

    return capabilities.map((parentCapability) => {
      const caveats = Object.entries(permissions[parentCapability]).map(([type, value]) => ({
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
    this.sessionStore.saveState<PermissionRequest>('permissions', {
      ...this.sessionStore.getState('permissions'),
      ...request,
    });

    return true;
  }

  async revokePermissions(request: PermissionRevokeRequest) {
    const permissions = this.sessionStore.getState<PermissionRequest>('permissions') || {};

    for (const method in request) {
      delete permissions[method];
    }

    this.sessionStore.saveState('permissions', permissions);
  }
}
