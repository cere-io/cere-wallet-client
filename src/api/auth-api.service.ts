import axios, { AxiosResponse } from 'axios';
import { WALLET_API } from '~/constants';

interface ApiResponse<T> {
  code: 'SUCCESS' | 'ERROR';
  data: T;
}

interface TokenData {
  token: string;
}

const api = axios.create({
  baseURL: WALLET_API,
});

export class AuthApiService {
  public static async sendOtp(email: string): Promise<boolean> {
    let result: AxiosResponse<ApiResponse<null>> | null = null;
    try {
      result = await api.post<ApiResponse<null>>('/auth/otp/send', { email });
    } catch (err: any) {
      console.error(err?.message);
    }
    return result?.data?.code === 'SUCCESS';
  }

  public static async getTokenByEmail(email: string, code: string): Promise<string | null> {
    let result: AxiosResponse<ApiResponse<TokenData>> | null = null;
    try {
      result = await api.post<{ code: 'SUCCESS' | 'ERROR'; data: { token: string } }>('/auth/token-by-email', {
        email,
        code,
      });
    } catch (err) {
      console.error(err);
    }
    return result?.data.code === 'SUCCESS' ? result?.data.data.token : null;
  }

  public static async getTokenBySocial(socialToken: string): Promise<string | null> {
    let result: AxiosResponse<ApiResponse<TokenData>> | null = null;
    try {
      result = await api.post<ApiResponse<TokenData>>('/auth/token-by-social', {
        token: socialToken,
      });
    } catch (err) {
      console.error(err);
    }
    return result?.data.code === 'SUCCESS' ? result?.data.data.token : null;
  }
}
