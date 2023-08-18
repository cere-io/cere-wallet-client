import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { UIProvider } from '@cere-wallet/ui';

import { Router } from './routes';
import { WalletContext, useAppContextStore } from './hooks';
import { DummyWalletStore } from './stores';

const App = observer(() => {
  const store = useAppContextStore();

  return (
    <UIProvider whiteLabel={toJS(store.whiteLabel)}>
      <Router />
    </UIProvider>
  );
});

export default function AppContext() {
  const currentUrl = new URL(window.location.href);
  const instanceId = currentUrl.searchParams.get('instanceId') || undefined;
  const dummyWallet = new DummyWalletStore(instanceId);

  return (
    <WalletContext.Provider value={dummyWallet}>
      <App />
    </WalletContext.Provider>
  );
}
