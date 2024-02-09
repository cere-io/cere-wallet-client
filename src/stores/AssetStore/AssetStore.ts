import { makeAutoObservable, autorun } from 'mobx';
import { getGlobalStorage } from '@cere-wallet/storage';

import { isTransferableAsset, Wallet, Asset, ReadyWallet } from './types';
import { serializeAssets, deserializeAssets } from './helper';
import { getStaticProvider } from '@cere-wallet/communication';

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
    const { NativeToken } = await import(/* webpackChunkName: "walletAssets" */ './NativeToken');
    const { UsdcToken } = await import(/* webpackChunkName: "walletAssets" */ './UsdcToken');
    const { Erc20Token } = await import(/* webpackChunkName: "walletAssets" */ './Erc20Token');
    const { CereErc20Token } = await import(/* webpackChunkName: "walletAssets" */ './CereErc20Token');
    const { UsdtToken } = await import(/* webpackChunkName: "walletAssets" */ './UsdtToken');

    const managableTokensFromStorage = getGlobalStorage().getItem('tokens');
    const parsedAssets: Asset[] = deserializeAssets(managableTokensFromStorage) || [];

    this.list = [
      new CereNativeToken(wallet),
      new CereErc20Token(wallet),
      new NativeToken(wallet),
      new UsdcToken(wallet),
      new UsdtToken(wallet),
    ];
    this.managableAssets = parsedAssets.map((asset) => new Erc20Token(wallet, asset));
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

    return createERC20Contract(getStaticProvider(this.wallet.provider).getSigner(), address);
  }
}
