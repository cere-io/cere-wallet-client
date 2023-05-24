export const createLocalConfig = (baseConfig: WebdriverIO.Config): WebdriverIO.Config => ({
  ...baseConfig,

  services: [...baseConfig.services, 'chromedriver'],
});
