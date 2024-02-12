import { action, makeAutoObservable } from 'mobx';
import type { PermissionRequest } from '@cere-wallet/wallet-engine';

import { createSharedPopupState } from '../sharedState';

export type PermissionsPopupState = {
  app?: {
    url: string;
    name: string;
  };

  status?: 'pending' | 'approved' | 'declined';
  permissions?: PermissionRequest;
  selectedPermissions?: PermissionRequest;
};

export class PermissionsPopupStore {
  private shared = createSharedPopupState<PermissionsPopupState>(this.preopenInstanceId, {}, { local: this.local });

  constructor(public readonly preopenInstanceId: string, private local = false) {
    makeAutoObservable(this, {
      approve: action.bound,
      decline: action.bound,
    });
  }

  get app() {
    return this.shared.state.app;
  }

  get isReady() {
    return !!this.shared.state.status;
  }

  get permissions() {
    return this.shared.state.permissions;
  }

  get selectedPermissions() {
    return this.shared.state.selectedPermissions || {};
  }

  set selectedPermissions(selectedPermissions: PermissionRequest) {
    this.shared.state.selectedPermissions = selectedPermissions;
  }

  approve() {
    this.shared.state.status = 'approved';
  }

  decline() {
    this.shared.state.status = 'declined';
  }
}
