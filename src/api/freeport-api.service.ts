import { FreeportNftInterface } from '~/api/interfaces/freeport-nft.interface';
import { FreeportCollectionInterface } from '~/api/interfaces/freeport-collection.interface';

// Freeport NFT API hosts are decommissioned (stage-freeport-api / freeport-api
// resolve to NXDOMAIN). All collectibles flows are no-ops until DDC-native
// replacement lands. Returning empty arrays keeps stores happy without HTTP.

export class FreeportApiService {
  public static async getWalletNftList(_wallet: string): Promise<FreeportNftInterface[]> {
    return [];
  }

  public static async getNftCids(_nftId: string): Promise<string[]> {
    return [];
  }

  public static async getMinterCollections(_minter: string): Promise<FreeportCollectionInterface[]> {
    return [];
  }
}
