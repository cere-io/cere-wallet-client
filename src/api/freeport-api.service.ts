import axios from 'axios';

import { reportError } from '~/reporting';
import { REACT_APP_FREEPORT_API } from '~/constants';
import { FreeportNftInterface } from '~/api/interfaces/freeport-nft.interface';
import { freeportNftValidator } from '~/api/validators/freeport-nft.validator';
import { freeportCollectionValidator } from '~/api/validators/freeport-collection.validator';
import { FreeportCollectionInterface } from '~/api/interfaces/freeport-collection.interface';

const api = axios.create({
  baseURL: REACT_APP_FREEPORT_API,
});

export class FreeportApiService {
  public static async getWalletNftList(wallet: string): Promise<FreeportNftInterface[]> {
    try {
      const { data } = await api.get<FreeportNftInterface[]>(`/api/wallet/${wallet}/owned`);
      return Array.isArray(data) ? data.filter((item: unknown) => freeportNftValidator(item)) : [];
    } catch (err: any) {
      reportError(err);
    }

    return [];
  }

  public static async getNftCids(nftId: string): Promise<string[]> {
    try {
      const { data } = await api.get<string[]>(`/nft/${nftId}/cids`);
      return Array.isArray(data) ? data.filter((item: unknown) => typeof item === 'string') : [];
    } catch (err: any) {
      reportError(err);
    }

    return [];
  }

  public static async getMinterCollections(minter: string): Promise<FreeportCollectionInterface[]> {
    try {
      const { data } = await api.get<FreeportCollectionInterface[]>(`/wallet/${minter}/collections`);
      return Array.isArray(data) ? data.filter((item: unknown) => freeportCollectionValidator(item)) : [];
    } catch (err: any) {
      reportError(err);
    }
    return [];
  }
}
