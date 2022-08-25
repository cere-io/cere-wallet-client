import { makeAutoObservable } from 'mobx';
import { Wallet } from '../types';

export class AccountAssets {
  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
  }
}
