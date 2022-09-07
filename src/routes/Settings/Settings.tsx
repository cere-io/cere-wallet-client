import { Box, ComingSoon } from '@cere-wallet/ui';

import { PageHeader } from '~/components';

export const Settings = () => (
  <>
    <PageHeader title="Settings" />

    <Box maxWidth="sm" marginX="auto">
      <ComingSoon
        title="Configure your wallet"
        description="We are working on the wallet configuration feature and very soon we will be ready to present it to you. Check our updates and we will let you know when it is ready."
      />
    </Box>
  </>
);
