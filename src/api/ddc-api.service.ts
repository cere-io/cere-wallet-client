import axios from 'axios';
import { DdcAssetInterface } from '~/api/interfaces/ddc-asset.interface';
import { DdcAssetValidator } from '~/api/validators';
import { REACT_APP_DDC_API } from '~/constants';

const api = axios.create({
  baseURL: REACT_APP_DDC_API,
});

export class DdcApiService {
  public static async getAssetInfo(wallet: string, cid: string): Promise<DdcAssetInterface | undefined> {
    try {
      const { data } = await api.get<DdcAssetInterface>(`/assets/v2/${wallet}/${cid}`);
      return DdcAssetValidator(data) ? data : undefined;
    } catch (err: any) {
      console.error(err?.message);
    }
  }
}
