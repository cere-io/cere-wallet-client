import { makeAutoObservable, autorun } from 'mobx';

import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';
import { CereNativeToken } from './CereNativeToken';
import { UsdcToken } from './UsdcToken';
import { isTransferableAsset, Wallet, Asset } from './types';
import { serializeAssets, deserializeAssets } from './helper';
import { createERC20Contract } from '@cere-wallet/wallet-engine';

export class AssetStore {
  private assets: Asset[] = [];
  private managableAssets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
    this.list = [];

    const managableTokensFromStorage = localStorage.getItem('tokens');
    const parsedAssets: Asset[] = deserializeAssets(managableTokensFromStorage) || [];

    autorun(() => {
      if (wallet.isReady()) {
        this.list = [new CereNativeToken(wallet), new NativeToken(wallet), new UsdcToken(wallet)];

        this.managableAssets = parsedAssets.map((asset) => new Erc20Token(wallet, asset));
      }
    });
  }

  get managableList() {
    return this.managableAssets;
  }

  set managableList(assets: Asset[]) {
    this.managableAssets = assets;

    localStorage.setItem('tokens', serializeAssets(assets));
  }

  get list() {
    return this.assets;
  }

  set list(assets: Asset[]) {
    this.assets = assets;
  }

  get transferable() {
    return this.assets.filter(isTransferableAsset);
  }

  get commonList() {
    return [...this.list, ...this.managableAssets];
  }

  get nativeToken() {
    return this.assets.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  transfer(ticker: string, to: string, amount: string) {
    const asset = this.transferable.find((asset) => asset.ticker === ticker);

    if (!asset) {
      throw new Error('Cannot transfer - unknown asset');
    }

    return asset.transfer(to, amount);
  }

  getAsset(ticker: string) {
    return this.assets.find((asset) => asset.ticker === ticker);
  }

  public addAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.managableList = [...this.managableList, new Erc20Token(this.wallet, assetParams)];
    }
  }

  public deleteAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.managableList = this.managableList.filter((asset) => assetParams.ticker !== asset.ticker);
    }
  }

  public getERC20Contract(address: string) {
    return createERC20Contract(this.wallet?.provider?.getSigner()!, address);
  }
}
