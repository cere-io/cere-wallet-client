import axios from 'axios';
import { FreeportCollectionInterface } from '~/api/interfaces/freeport-collection.interface';
import { FreeportNftInterface } from '~/api/interfaces/freeport-nft.interface';
import { freeportCollectionValidator } from '~/api/validators/freeport-collection.validator';
import { freeportNftValidator } from '~/api/validators/freeport-nft.validator';
import { REACT_APP_FREEPORT_API } from '~/constants';

const api = axios.create({
  baseURL: REACT_APP_FREEPORT_API,
});

export class FreeportApiService {
  public static async getWalletNftList(wallet: string): Promise<FreeportNftInterface[]> {
    try {
      const { data } = await api.get<FreeportNftInterface[]>(`/wallet/${wallet}/nfts/owned`);
      return Array.isArray(data) ? data.filter((item: unknown) => freeportNftValidator(item)) : [];
    } catch (err: any) {
      console.error(err?.message);
    }
    return [];
  }

  public static async getNftCids(nftId: string): Promise<string[]> {
    try {
      const { data } = await api.get<string[]>(`/nft/${nftId}/cids`);
      return Array.isArray(data) ? data.filter((item: unknown) => typeof item === 'string') : [];
    } catch (err: any) {
      console.error(err?.message);
    }
    return [];
  }

  public static async getMinterCollections(minter: string): Promise<FreeportCollectionInterface[]> {
    try {
      const { data } = await api.get<FreeportCollectionInterface[]>(`/wallet/${minter}/collections`);
      return Array.isArray(data) ? data.filter((item: unknown) => freeportCollectionValidator(item)) : [];
    } catch (err: any) {
      console.error(err?.message);
    }
    return [];
  }
}
