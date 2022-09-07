import { observer } from 'mobx-react-lite';
import {
  Address,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  ContentCopyIcon,
  IconButton,
  QrCodeScannerIcon,
  Stack,
  Truncate,
} from '@cere-wallet/ui';

import { useAccountStore } from '~/hooks';
import { AccountBalance } from '../AccountBalance';

export type AccountInfoProps = {};

const AccountInfo = (props: AccountInfoProps) => {
  const { account } = useAccountStore();

  if (!account) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title={<Truncate variant="email" text={account.email} maxLength={16} />}
        subheader={<Address variant="text" address={account.address} maxLength={16} />}
        avatar={<Avatar src={account.avatar} />}
        action={
          <Stack direction="row" spacing={1}>
            <IconButton>
              <ContentCopyIcon />
            </IconButton>
            <IconButton>
              <QrCodeScannerIcon />
            </IconButton>
          </Stack>
        }
      />
      <CardContent>
        <AccountBalance variant="h6" />
      </CardContent>
    </Card>
  );
};

export default observer(AccountInfo);
