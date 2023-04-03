import { makeAutoObservable, autorun } from 'mobx';

import { isTransferableAsset, Wallet, Asset, ReadyWallet } from './types';
import { serializeAssets, deserializeAssets } from './helper';

export class AssetStore {
  private assets: Asset[] = [];
  private managableAssets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
    this.list = [];

    autorun(() => {
      if (wallet.isReady()) {
        this.init(wallet);
      }
    });
  }

  async init(wallet: ReadyWallet) {
    const { CereNativeToken } = await import(/* webpackChunkName: "CereNativeToken" */ './CereNativeToken');
    const { NativeToken } = await import(/* webpackChunkName: "NativeToken" */ './NativeToken');
    const { UsdcToken } = await import(/* webpackChunkName: "UsdcToken" */ './UsdcToken');
    const { Erc20Token } = await import(/* webpackChunkName: "Erc20Token" */ './Erc20Token');

    const managableTokensFromStorage = localStorage.getItem('tokens');
    const parsedAssets: Asset[] = deserializeAssets(managableTokensFromStorage) || [];

    this.list = [new CereNativeToken(wallet), new NativeToken(wallet), new UsdcToken(wallet)];
    this.managableAssets = parsedAssets.map((asset) => new Erc20Token(wallet, asset));
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

  async addAsset(assetParams: Asset) {
    const { Erc20Token } = await import('./Erc20Token');

    if (this.wallet.isReady()) {
      this.managableList = [...this.managableList, new Erc20Token(this.wallet, assetParams)];
    }
  }

  deleteAsset(assetParams: Asset) {
    if (this.wallet.isReady()) {
      this.managableList = this.managableList.filter((asset) => assetParams.ticker !== asset.ticker);
    }
  }

  async getERC20Contract(address: string) {
    const { createERC20Contract } = await import('@cere-wallet/wallet-engine');

    return createERC20Contract(this.wallet.provider!.getSigner(), address);
  }
}
