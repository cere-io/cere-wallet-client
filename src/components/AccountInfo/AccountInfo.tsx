import { observer } from 'mobx-react-lite';
import {
  Address,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CopyButton,
  Stack,
  Truncate,
  useIsMobile,
} from '@cere-wallet/ui';
import { useAccountStore } from '~/hooks';
import { AccountBalance } from '../AccountBalance';
import { AddressQRButton } from '../AddressQRButton';

export type AccountInfoProps = {};

const AccountInfo = (props: AccountInfoProps) => {
  const isMobile = useIsMobile();
  const maxLength = isMobile ? 12 : 16;
  const { account, user } = useAccountStore();

  if (!account || !user) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title={<Truncate variant="email" text={user.email} maxLength={maxLength} />}
        subheader={<Address variant="text" address={account.address} maxLength={maxLength} />}
        avatar={<Avatar src={user.avatar} />}
        action={
          <Stack direction="row" spacing={1}>
            <CopyButton value={account.address} successMessage="Address copied" />
            <AddressQRButton address={account.address} />
          </Stack>
        }
      />
      <CardContent>
        <AccountBalance variant="h3" />
      </CardContent>
    </Card>
  );
};

export default observer(AccountInfo);
