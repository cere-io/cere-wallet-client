import { observer } from 'mobx-react-lite';
import { ComingSoon, Stack } from '@cere-wallet/ui';

const TransferCollectibles = () => {
  return (
    <Stack alignItems="stretch" spacing={2}>
      <ComingSoon
        title="Collectibles transfer"
        description="Soon you will be able to transfer your collectibles. Stay tuned for updates."
      />
    </Stack>
  );
};

export default observer(TransferCollectibles);
