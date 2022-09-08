import { Auth } from '@cere-wallet/authentication';
import { Paper, Stack, Button } from '@cere-wallet/ui';
import { useEffect, useMemo, useState } from 'react';

export const Login = () => {
  const auth = useMemo(
    () =>
      new Auth({
        baseUrl: `${window.origin}/login`,
      }),
    [],
  );

  const [result, setResult] = useState<any>();

  useEffect(() => {
    auth.init();
  }, [auth]);

  return (
    <Stack spacing={2} alignItems="center" marginTop={10}>
      <Button
        variant="contained"
        onClick={async () => {
          await auth.logout();

          const res = await auth.login();

          setResult(res);
        }}
      >
        Log In
      </Button>

      <Paper variant="outlined" sx={{ padding: 3, overflow: 'auto', width: 800 }}>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </Paper>
    </Stack>
  );
};
