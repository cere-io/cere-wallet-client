import { options } from './options';

export const createCIConfig = (baseConfig: WebdriverIO.Config): WebdriverIO.Config => ({
  ...baseConfig,

  baseUrl: options.targetUrl || 'http://host.docker.internal:4567/',
  hostname: 'localhost',
  port: 4444,
  path: '/wd/hub/',
});
