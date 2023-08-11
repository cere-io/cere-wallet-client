import { useMemo } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { randomBytes } from 'crypto';
import { UIProvider } from '@cere-wallet/ui';
import { AppContext } from '@cere/communication';
import { Router } from './routes';
import { createSharedState } from '~/stores/sharedState';

type SharedState = {
  context?: AppContext;
};

const App = () => {
  const url = new URL(window.location.href);
  const instanceId = url.searchParams.get('instanceId') || randomBytes(16).toString('hex');

  const context = useMemo(
    () => createSharedState<SharedState>(`context.${instanceId}`, {}, { readOnly: true }),
    [instanceId],
  );
  const contextState = toJS(context.state.context?.app.whiteLabel);

  return (
    <UIProvider whiteLabel={contextState}>
      <Router />
    </UIProvider>
  );
};

export default observer(App);
