import { getIFrameOrigin } from '@cere-wallet/communication';
import { Permission, PermissionRequest, PermissionRevokeRequest } from '@cere-wallet/wallet-engine';

import { SessionStore } from '../SessionStore';
import { PopupManagerStore } from '../PopupManagerStore';
import type { PermissionsPopupState } from '../PermissionsPopupStore';
import { AppContextStore } from '../AppContextStore';
import { when } from 'mobx';
import { ALLOWED_WALLET_PERMISSIONS } from '~/constants';

const requestToPermissions = (request: PermissionRequest): Permission[] => {
  return Object.keys(request).map((parentCapability) => {
    const caveats = Object.entries(request[parentCapability]).map(([type, value]) => ({ type, value }));

    return { parentCapability, caveats, invoker: getIFrameOrigin() };
  });
};

const validatePermissionRequest = (request: PermissionRequest) => {
  for (const method in request) {
    if (!ALLOWED_WALLET_PERMISSIONS.includes(method as any)) {
      throw new Error(`Permission ${method} is not allowed`);
    }
  }
};

export class PermissionsStore {
  constructor(
    private sessionStore: SessionStore,
    private popupManagerStore: PopupManagerStore,
    private contextStore: AppContextStore,
  ) {}

  get permissions(): Permission[] {
    const permissions = this.sessionStore.getState<PermissionRequest>('permissions') || {};

    return requestToPermissions(permissions);
  }

  async requestPermissions(permissionsRequest: PermissionRequest) {
    validatePermissionRequest(permissionsRequest);

    const popupId = this.popupManagerStore.createModal();
    const popup = await this.popupManagerStore.proceedTo<PermissionsPopupState>(popupId, '/permissions', {
      status: 'pending',
      app: this.contextStore.app,
      permissions: requestToPermissions(permissionsRequest),
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(popupId);

    const { status, selectedPermissions } = popup.state;

    if (status !== 'approved' || !selectedPermissions?.length) {
      return {};
    }

    const nextPermissions: PermissionRequest = {};
    for (const permission of selectedPermissions) {
      nextPermissions[permission] = permissionsRequest[permission];
    }

    this.sessionStore.saveState<PermissionRequest>('permissions', {
      ...this.sessionStore.getState('permissions'),
      ...nextPermissions,
    });

    return nextPermissions;
  }

  async revokePermissions(request: PermissionRevokeRequest) {
    const permissions = this.sessionStore.getState<PermissionRequest>('permissions') || {};

    for (const method in request) {
      delete permissions[method];
    }

    this.sessionStore.saveState('permissions', permissions);
  }
}
