import { Stack, useIsMobile } from '@cere-wallet/ui';
import { IntroPage } from '~/components/Login/IntroPage';

export const IntroRoute = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Stack direction="column" textAlign="justify" padding={2}>
        <IntroPage />
      </Stack>
    );
  }

  return (
    <Stack direction="row" justifyContent="center" alignItems="center" padding={2} height="100vh">
      <Stack width={375}>
        <IntroPage />
      </Stack>
    </Stack>
  );
};
