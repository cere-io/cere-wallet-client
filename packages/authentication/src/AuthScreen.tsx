import { useEffect, useState } from 'react';

const authToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQ0MiwidXNlcm5hbWUiOiIiLCJzZXNzaW9uSWQiOiJiNzk0MWI1MS02NWM1LTQ0YTEtOGVmMy1iZGRkMzM0ZGE0MTgiLCJhcHBJZCI6IjIwOTUiLCJpYXQiOjE2NjI2MDcwODQsImV4cCI6MTY3MTI0NzA4NH0.Q_bEpzt3cDSgxdTl84ne3yXbUj88z-JzczjTrCExQ3swznVDrGDQD4FAZPaKoTlN4jrvnvOdxjK7Io3f2DayptX5PZ8hul_9lQQFsiahRmtnBiTK-h6KQo_xWU9vOnASM7RzZlsbeuMWNHm8UxNXR1JYYgUZzfmE8uIIIJdJRmGqNHGGZIcbzefu8Ow7AGdVsHaL6S-CCYTB_dfmgMuZpicdyqpqYvL1TPLIth4pd3aJ4wsHj6-O7O0fGt3sU1eZZd06aE4ZJ6u_W2RHTaZR9H6DNf8OwaDOI0Nf4X0Y2kvVOsxM-hb7kCGshsVuBlTaYg25gogtXz4HC7W7HBUqJg';

export type AuthScreenProps = {};

const useIdToken = () => {
  const [idToken, setIdToken] = useState<string | null>(null);

  fetch('https://id.dev.cere.io/identity/id-token', {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  })
    .then((response) => response.text())
    .then(setIdToken);

  return idToken;
};

export const AuthScreen = (props: AuthScreenProps) => {
  const idToken = useIdToken();

  useEffect(() => {
    if (!idToken) {
      return;
    }

    const url = new URL(window.location.href);
    const redirectUri = url.searchParams.get('redirect_uri');
    const nextUrl = new URL(redirectUri!);

    const nextParams = new URLSearchParams(url.search);
    nextParams.set('redirect_uri', url.origin + url.pathname);
    nextParams.set('id_token', idToken);

    nextUrl.hash = nextParams.toString();

    window.location.href = nextUrl.toString();
  }, [idToken]);

  return <div>Hello Authentication...</div>;
};
