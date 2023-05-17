import { config as baseConfig } from './base';

export const config: WebdriverIO.Config = {
  ...baseConfig,

  baseUrl: 'http://host.docker.internal:4567/',
  hostname: 'localhost',
  port: 4444,
  path: '/wd/hub/',
};
