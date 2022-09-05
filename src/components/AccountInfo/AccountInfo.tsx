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
  const { address, userInfo } = useAccountStore();

  if (!address || !userInfo) {
    return null;
  }

  const [, emailDomain] = userInfo.email.split('@');

  return (
    <Card>
      <CardHeader
        title={<Truncate text={userInfo.email} maxLength={16} endingLength={emailDomain.length} />}
        subheader={<Address variant="text" address={address} maxLength={16} />}
        avatar={<Avatar src={userInfo.profileImage} />}
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
