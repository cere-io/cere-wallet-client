import axios, { AxiosError, AxiosResponse } from 'axios';

import { reportError } from '~/reporting';
import { FEATURE_FLAGS, WALLET_API } from '~/constants';
import { ApiResponse } from '~/api/interfaces';

export type TokenData = {
  token: string;
};

export type TokenByLinkData = TokenData & {
  code: string;
};

export type SendOtpOptions = {
  appTitle?: string;
  supportEmail?: string;
  authLink?: boolean;
  popupId?: string;
};

const api = axios.create({
  baseURL: WALLET_API,
});

export class AuthApiService {
  public static async sendOtp(email: string, options: SendOtpOptions = {}): Promise<string | null> {
    let result: AxiosResponse<ApiResponse<{ authLinkCode: string }>> | null = null;

    try {
      result = await api.post('/auth/otp/send', {
        ...options,
        email,
        authLink: options.authLink ?? FEATURE_FLAGS.otpLink,
      });
    } catch (err: any) {
      reportError(err);
    }

    return result?.data?.data?.authLinkCode || null;
  }

  public static async getTokenByEmail(email: string, code: string): Promise<string | null> {
    let result: AxiosResponse<ApiResponse<TokenData>> | null = null;
    try {
      result = await api.post<{ code: 'SUCCESS' | 'ERROR'; data: { token: string } }>('/auth/token-by-email', {
        email,
        code,
      });
    } catch (error) {
      const isUserError = error instanceof AxiosError && error.code === 'ERR_BAD_REQUEST';

      if (!isUserError) {
        reportError(error);
      }
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
      reportError(err);
    }
    return result?.data.code === 'SUCCESS' ? result?.data.data.token : null;
  }

  public static async validateLink(email: string, authLinkCode: string, otp: string): Promise<boolean> {
    let result: AxiosResponse<ApiResponse<null>> | null = null;

    try {
      result = await api.post<ApiResponse<null>>('/auth/otp/validate', { email, otp, authLinkCode });
    } catch (err: any) {
      reportError(err);
    }

    return result?.data?.code === 'SUCCESS';
  }

  public static async getTokenByLink(email: string, authLinkCode: string): Promise<TokenByLinkData | null> {
    let result: AxiosResponse<ApiResponse<TokenByLinkData | null>> | null = null;

    try {
      result = await api.post('/auth/token-by-link', { email, authLinkCode });
    } catch (err: any) {
      reportError(err);
    }

    return result?.data?.data || null;
  }
}
