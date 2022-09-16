import { Box, ComingSoon } from '@cere-wallet/ui';

import { PageHeader } from '~/components';

export const Collectibles = () => (
  <>
    <PageHeader title="Collectables" />

    <Box maxWidth="sm" marginX="auto">
      <ComingSoon
        title="Send, store, and receive your collectibles"
        description="We are working on the collectibles feature and very soon we will be ready to present it to you. Check our updates and we will let you know when it is ready."
      />
    </Box>
  </>
);
