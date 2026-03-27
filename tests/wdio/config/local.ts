export const createLocalConfig = (baseConfig: WebdriverIO.Config): WebdriverIO.Config => ({
  ...baseConfig,

  services: [
    ...baseConfig.services,
    [
      'chromedriver',
      {
        chromedriverCustomPath: require.resolve('chromedriver/bin/chromedriver'),
      },
    ],
  ],
});
