import { APP_VERSION, APP_ENV, SENTRY_DNS, OPEN_LOGIN_NETWORK, APP_SIMULATION } from '../constants';
import { Sentry } from './Sentry';

const Reporting = new Sentry({
  dsn: SENTRY_DNS,
  enabled: !!SENTRY_DNS,
  release: `cere-wallet-client@${APP_VERSION}`,
  environment: APP_ENV,
  initialScope: {
    tags: {
      authNetwork: OPEN_LOGIN_NETWORK,
      simulation: APP_SIMULATION,
    },
  },
});

export const reportError = Reporting.error;
export const reportMesssage = Reporting.message;

export default Reporting;
