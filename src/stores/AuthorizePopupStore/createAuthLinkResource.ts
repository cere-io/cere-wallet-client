import { fromResource, IResource } from 'mobx-utils';
import { AuthApiService } from '~/api/auth-api.service';

export type AuthLinkResource = IResource<string | undefined>;

export const createAuthLinkResource = (email: string, linkCode: string): AuthLinkResource => {
  let timeout: NodeJS.Timeout;

  const start = async (run: () => Promise<boolean>) => {
    if (await run()) {
      return clearTimeout(timeout);
    }

    timeout = setTimeout(() => start(run), 1000);
  };

  return fromResource<string>(
    (sink) =>
      start(async () => {
        const idToken = await AuthApiService.getTokenByLink(email, linkCode);

        if (idToken) {
          sink(idToken);
        }

        return !!idToken;
      }),
    () => clearTimeout(timeout),
  );
};
