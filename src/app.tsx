import { get, toJS, isObservable, values } from 'mobx';
import { useEffect } from 'react';
import { UIProvider } from '@cere-wallet/ui';
import { Router } from './routes';
import { AppContext } from '@cere/communication';
import { createSharedState } from '~/stores/sharedState';

type SharedState = {
  context?: AppContext;
};

export const App = () => {
  const url = new URL(window.location.href);
  const instanceId = url.searchParams.get('instanceId');

  useEffect(() => {
    if (instanceId) {
      console.log(instanceId, 'instanceId');
      const context = createSharedState<SharedState>(`context.${instanceId}`, {}, { readOnly: false });
      console.log(isObservable(context), context, 'context');
    }
  }, [instanceId]);

  return (
    <UIProvider>
      <Router />
    </UIProvider>
  );
};
