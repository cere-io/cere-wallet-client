import { fromResource, IResource } from 'mobx-utils';
import { AuthApiService, TokenByLinkData } from '~/api/auth-api.service';

export type AuthLinkResourcePayload = TokenByLinkData;
export type AuthLinkResource = IResource<AuthLinkResourcePayload | undefined>;

export const createAuthLinkResource = (email: string, linkCode: string): AuthLinkResource => {
  let timeout: NodeJS.Timeout;

  const start = async (run: () => Promise<boolean>) => {
    if (await run()) {
      return clearTimeout(timeout);
    }

    timeout = setTimeout(() => start(run), 1000);
  };

  return fromResource<TokenByLinkData>(
    (sink) =>
      start(async () => {
        const data = await AuthApiService.getTokenByLink(email, linkCode);

        if (data) {
          sink(data);
        }

        return !!data;
      }),
    () => clearTimeout(timeout),
  );
};
