import { getIFrameOrigin } from '@cere-wallet/communication';
import { Permission, PermissionRequest, PermissionRevokeRequest } from '@cere-wallet/wallet-engine';

import { PopupManagerStore } from '../PopupManagerStore';
import type { PermissionsPopupState } from '../PermissionsPopupStore';
import { AppContextStore } from '../AppContextStore';
import { makeAutoObservable, when } from 'mobx';
import { ALLOWED_WALLET_PERMISSIONS } from '~/constants';
import { ApplicationsStore } from '../ApplicationsStore';

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
    private applicationsStore: ApplicationsStore,
    private popupManagerStore: PopupManagerStore,
    private contextStore: AppContextStore,
  ) {
    makeAutoObservable(this);
  }

  private async getAppPermissions() {
    return this.applicationsStore.currentApp?.permissions || {};
  }

  async getPermissions() {
    return requestToPermissions(await this.getAppPermissions());
  }

  async requestPermissions(permissionsRequest: PermissionRequest) {
    validatePermissionRequest(permissionsRequest);

    const popupId = this.popupManagerStore.createModal();
    const popup = await this.popupManagerStore.proceedTo<PermissionsPopupState>(popupId, '/permissions', {
      status: 'pending',
      app: this.contextStore.app,
      permissions: permissionsRequest,
      selectedPermissions: permissionsRequest,
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(popupId);

    const { status, selectedPermissions = {} } = popup.state;

    if (status !== 'approved' || !Object.keys(selectedPermissions).length) {
      return {};
    }

    const appPermissions = await this.getAppPermissions();
    await this.applicationsStore.saveApplication({
      permissions: { ...appPermissions, ...selectedPermissions },
    });

    return selectedPermissions;
  }

  async revokePermissions(request: PermissionRevokeRequest) {
    const appPermissions = await this.getAppPermissions();
    const permissions = { ...appPermissions };

    for (const method in request) {
      delete permissions[method];
    }

    await this.applicationsStore.saveApplication({ permissions });
  }
}
