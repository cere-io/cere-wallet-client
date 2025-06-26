import { TopUpHistory } from '~/components/TopUpHistory';
import { useAccountStore } from '~/hooks';

export const TopUpHistoryRoute = () => {
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccount ? accountStore.getAccount('ed25519')?.address : undefined;

  return <TopUpHistory accountId={accountId} />;
};
