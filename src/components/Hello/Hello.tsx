import { observer } from 'mobx-react-lite';
import { Box } from '@cere-wallet/ui';

import { WalletStore } from '~/stores';

export type HelloProps = {
  store: Pick<WalletStore, 'ticks'>;
};

const Hello = ({ store }: HelloProps) => {
  return (
    <Box
      sx={{
        fontSize: '40px',
        textAlign: 'center',
      }}
    >
      Cere wallet client {store.ticks}
    </Box>
  );
};

export default observer(Hello);
