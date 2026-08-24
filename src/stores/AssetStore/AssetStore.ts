import { makeAutoObservable, autorun } from 'mobx';
import { getGlobalStorage } from '@cere-wallet/storage';

import { isTransferableAsset, Wallet, Asset, ReadyWallet } from './types';
import { serializeAssets, deserializeAssets } from './helper';

export class AssetStore {
  private assets: undefined | Asset[];
  private managableAssets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    autorun(() => {
      if (wallet.isReady()) {
        this.init(wallet);
      }
    });
  }

  async init(wallet: ReadyWallet) {
    const { CereNativeToken } = await import(/* webpackChunkName: "walletAssets" */ './CereNativeToken');
    const { Erc20Token } = await import(/* webpackChunkName: "walletAssets" */ './Erc20Token');

    const managableTokensFromStorage = getGlobalStorage().getItem('tokens');
    const parsedAssets: Asset[] = deserializeAssets(managableTokensFromStorage) || [];

    // Polygon assets removed: NativeToken (MATIC), UsdcToken, UsdtToken,
    // CereErc20Token (Polygon-wrapped CERE). Cere Network native is the only
    // first-class asset until ETH-mainnet CERE ERC20 lands.
    this.list = [new CereNativeToken(wallet)];

    this.managableList = parsedAssets.map((asset) => new Erc20Token(wallet, asset));
  }

  get managableList() {
    return this.managableAssets;
  }

  set managableList(assets: Asset[]) {
    this.managableAssets = assets;

    getGlobalStorage().setItem('tokens', serializeAssets(assets));
  }

  get loading() {
    return this.assets === undefined;
  }

  get list() {
    return this.assets || [];
  }

  set list(assets: Asset[]) {
    this.assets = assets;
  }

  get transferable() {
    return this.list.filter(isTransferableAsset);
  }

  get commonList() {
    return [...this.list, ...this.managableAssets];
  }

  get nativeToken() {
    return this.list.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  transfer(ticker: string, to: string, amount: string) {
    const asset = this.transferable.find((asset) => asset.ticker === ticker);

    if (!asset) {
      throw new Error('Cannot transfer - unknown asset');
    }

    return asset.transfer(to, amount);
  }

  getAsset(ticker: string) {
    return this.list.find((asset) => asset.ticker === ticker);
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
