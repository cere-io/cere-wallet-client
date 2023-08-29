import dns from 'dns';
import { options } from './options';

export const createCIConfig = (baseConfig: WebdriverIO.Config): WebdriverIO.Config => ({
  ...baseConfig,

  baseUrl: options.targetUrl || 'http://host.docker.internal:4567/',
  hostname: 'localhost',
  port: 4444,
  path: '/wd/hub/',

  /**
   * Fix for braking DNS lookup changes in NodeJS 18+
   * https://github.com/webdriverio/webdriverio/issues/8279
   */
  beforeSession: () => {
    dns.setDefaultResultOrder('ipv4first');
  },
});
