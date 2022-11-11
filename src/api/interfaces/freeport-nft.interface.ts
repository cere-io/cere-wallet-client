export interface FreeportNftInterface {
  nftId: string;
  minter: string;
  collectionAddress: string | null;
  supply: number;
  quantity: number;
  priceInUsdCents: number;
  priceInCereUnits: number;
}
