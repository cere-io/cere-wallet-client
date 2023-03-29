export const createNextUrl = (idToken?: string) => {
  const url = new URL(window.location.href);
  const nextUrl = new URL(url.searchParams.get('redirect_uri')!);
  const nextParams = new URLSearchParams(url.search);

  if (idToken) {
    nextParams.set('id_token', idToken);
  }

  nextUrl.hash = nextParams.toString();

  return nextUrl.toString();
};
