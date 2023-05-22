import * as path from 'path';
import * as allure from '@wdio/allure-reporter';
import historyApiMiddleware from 'express-history-api-fallback';
import { configure } from '@testing-library/webdriverio';

import { options } from './options';

const rootDir = path.resolve(__dirname, '../../..');
const bundleRoot = path.resolve(rootDir, 'build');

export const chromeCapability: WebDriver.DesiredCapabilities = {
  browserName: 'chrome',
  acceptInsecureCerts: true,

  'goog:chromeOptions': {
    args: [
      '--window-size=1920,1080',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--mute-audio',

      ...(options.openDevTools ? ['--auto-open-devtools-for-tabs'] : []),
      ...(options.headless ? ['--headless', '--disable-gpu'] : []),
    ],
  },

  // @ts-ignore
  'goog:loggingPrefs': { browser: 'ALL' },

  'selenoid:options': {
    /**
     * The hardcoded IP address is the address of GitHub actions host
     *
     * TODO: Figure out a better way to dected CI host IP, insted of hardcoding this one
     */
    hostsEntries: ['host.docker.internal:172.17.0.1'],
  },
};

let baseUrl = options.targetUrl;
const services: WebdriverIO.Config['services'] = [];

if (!baseUrl) {
  baseUrl = 'http://localhost:4567/';

  services.push([
    'static-server',
    {
      folders: [
        {
          mount: '/',
          path: bundleRoot,
        },
      ],
      middleware: [
        {
          mount: '/',
          middleware: historyApiMiddleware('index.html', { root: bundleRoot }),
        },
      ],
    },
  ]);
}

export const config: WebdriverIO.Config = {
  baseUrl,
  services,

  runner: 'local',

  specs: ['./specs/**/*.ts'],
  suites: {
    simulation: ['./specs/standalone/Login.e2e.ts'],
  },

  capabilities: [chromeCapability],

  logLevel: 'warn',
  maxInstances: options.maxInstances,

  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: path.resolve(rootDir, './report/allure-results'),
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true,
    },
  },

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
    require: [require.resolve('mocha-steps')],
  },

  async before() {
    require('./setup');

    allure.addEnvironment('APP_ENV', process.env.REACT_APP_ENV);
  },

  async afterTest(test, context, { error }) {
    const logs = await browser.getLogs('browser');

    allure.addAttachment('Browser logs', JSON.stringify(logs, null, 2), 'text/plain');

    if (error) {
      await browser.takeScreenshot();
    }
  },
};

configure({
  asyncUtilTimeout: config.waitforTimeout,
});
