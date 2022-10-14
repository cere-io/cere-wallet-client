import { Stack, useIsMobile } from '@cere-wallet/ui';
import { IntroPage } from '~/components/Login/IntroPage';

export const IntroRoute = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Stack direction="column" textAlign="justify" padding="16px">
        <IntroPage />
      </Stack>
    );
  }

  return (
    <Stack direction="row" justifyContent="center" alignItems="center" padding="16px" height="100vh">
      <Stack width="375px">
        <IntroPage />
      </Stack>
    </Stack>
  );
};
