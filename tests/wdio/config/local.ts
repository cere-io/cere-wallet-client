import { config as baseConfig } from './base';

export const config: WebdriverIO.Config = {
  ...baseConfig,

  services: [...baseConfig.services, 'chromedriver'],
};
