import axios, { AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: 'http://api.wallet.dev.cere.io',
});

export class AuthApiService {
  public static async sendOtp(email: string): Promise<boolean> {
    let result: AxiosResponse<{ code: 'SUCCESS' | 'ERROR' }> | null = null;
    try {
      result = await api.post<{ code: 'SUCCESS' | 'ERROR' }>('/auth/otp/send', { email });
    } catch (err) {
      console.error(err);
    }
    return result?.data?.code === 'SUCCESS';
  }

  public static async getToken(email: string, code: string): Promise<string | null> {
    let result: AxiosResponse<{ code: 'SUCCESS' | 'ERROR'; data: { token: string } }> | null = null;
    try {
      result = await api.post<{ code: 'SUCCESS' | 'ERROR'; data: { token: string } }>('/auth/token', { email, code });
    } catch (err) {
      console.error(err);
    }
    return result?.data.code === 'SUCCESS' ? result?.data.data.token : null;
  }
}
