import { makeAutoObservable, runInAction, reaction } from 'mobx';

import { Nft, Wallet } from '../types';
import { FreeportApiService } from '~/api/freeport-api.service';
import { DdcApiService } from '~/api/ddc-api.service';
import { REACT_APP_DDC_API } from '~/constants';

export class CollectiblesStore {
  private _nfts: Nft[] = [];
  private _isLoading: boolean = false;
  private _filter: string = '';

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    reaction(
      () => wallet.account?.address,
      async (address) => {
        if (address) {
          await this.updateNfts(address);
        } else {
          this._nfts = [];
        }
      },
    );
  }

  get nfts(): Nft[] {
    return this._nfts;
  }

  get filteredNfts(): Nft[] {
    return this._nfts.filter((nft: Nft) =>
      `${nft.title}${nft.description}${nft.minter}${nft.nftId}`.toLowerCase().includes(this._filter.toLowerCase()),
    );
  }

  set filter(value: string) {
    this._filter = value;
  }

  get filter(): string {
    return this._filter;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  public getNftById(nftId: string): Nft | undefined {
    return this._nfts.find((item) => item.nftId === nftId);
  }

  public async updateNfts(wallet: string) {
    this._isLoading = true;

    const freeportNfts = await FreeportApiService.getWalletNftList(wallet);
    const nftIds: string[] = freeportNfts.map((nft) => nft.nftId);
    const minters: string[] = freeportNfts.map((nft) => '').filter(Boolean);
    const cids = await Promise.all(nftIds.map(FreeportApiService.getNftCids));
    const assets = await Promise.all(cids.map((cid, i) => DdcApiService.getAssetInfo(minters[i], cid[0])));
    const collections = await Promise.all(Array.from(new Set(minters)).map(FreeportApiService.getMinterCollections));
    const collectionKeyMap: { [key: string]: string } = collections
      .flat(1)
      .reduce((a, v) => ({ ...a, [v.address]: v.name }), {});

    const result = freeportNfts.map((nft, i) => ({
      nftId: nft.nftId,
      minter: '', // TODO: Add to the API
      title: assets[i]?.contentMetadata?.title || nft.nftId,
      description: assets[i]?.contentMetadata?.description,
      previewUrl:
        cids[i]?.length > 0 ? `${REACT_APP_DDC_API}/assets/v2/${minters[i]}/${cids[i][0]}/preview` : undefined,
      network: 'CERE',
      collectionAddress: nft.collection ? nft.collection.address : undefined,
      collectionName: nft.collection ? collectionKeyMap[nft.collection.address] : undefined,
      quantity: 0, // TODO: Add to the API
    }));

    runInAction(() => {
      this._isLoading = false;
      this._nfts = result;
    });
  }
}
