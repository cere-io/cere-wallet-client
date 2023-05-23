import path from 'path';
import fs from 'fs';
import * as allure from '@wdio/allure-reporter';
import { rootDir } from './options';

const outputDir = path.resolve(rootDir, './report/allure-results');

/**
 * Write Allure environment file directelly due to a bug in `allure.addEnvironment` which allows only one variable to be added
 *
 * https://github.com/webdriverio/webdriverio/issues/10321
 */
const writeEnvironmentVars = (vars: Record<string, string>) => {
  const file = path.resolve(outputDir, 'environment.properties');
  const content = Object.entries(vars)
    .map(([name, value]) => `${name}=${value}`)
    .join('\n');

  fs.writeFileSync(file, content + '\n');
};

export const withAllure = (baseConfig: WebdriverIO.Config): WebdriverIO.Config => ({
  ...baseConfig,

  reporters: [
    ...baseConfig.reporters,
    [
      'allure',
      {
        outputDir,
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  async afterTest(test, context, result) {
    const logs = await browser.getLogs('browser');

    allure.addAttachment('Browser logs', JSON.stringify(logs, null, 2), 'application/json');

    if (result.error) {
      await browser.takeScreenshot();
    }
  },

  onComplete() {
    writeEnvironmentVars({
      REACT_APP_ENV: process.env.REACT_APP_ENV,
      REACT_APP_WALLET_API: process.env.REACT_APP_WALLET_API,
      REACT_APP_FREEPORT_API: process.env.REACT_APP_FREEPORT_API,
      REACT_APP_DDC_API: process.env.REACT_APP_DDC_API,
      REACT_APP_TORUS_AUTH_NETWORK: process.env.REACT_APP_TORUS_AUTH_NETWORK,
      REACT_APP_TORUS_AUTH_VERIFIER: process.env.REACT_APP_TORUS_AUTH_VERIFIER,
    });
  },
});
