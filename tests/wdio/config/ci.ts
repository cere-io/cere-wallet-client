import { config as baseConfig } from './base';

export const config: WebdriverIO.Config = {
  ...baseConfig,

  /**
   * The hardcoded IP address is the address of GitHub actions host
   *
   * TODO: Figure out a better way to dected CI host IP, insted of hardcoding this one
   */
  baseUrl: 'http://172.17.0.1:4567/',

  hostname: 'localhost',
  port: 4444,
  path: '/wd/hub/',
};
