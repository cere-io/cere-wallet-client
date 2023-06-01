import * as path from 'path';
import historyApiMiddleware from 'express-history-api-fallback';
import { configure } from '@testing-library/webdriverio';

import { options, rootDir } from './options';
import { setup } from './setup';

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
      '--disable-notifications',
      '--disable-web-security',

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
const services: WebdriverIO.Config['services'] = ['intercept'];

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

  waitforTimeout: 10 * 1000, // 10 secs
  connectionRetryTimeout: 2 * 60 * 1000, // 2 mins
  connectionRetryCount: 3,

  reporters: ['spec'],

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
    timeout: 3 * 60 * 1000, // 3 mins
    require: [require.resolve('mocha-steps')],
  },

  async before() {
    await setup();
  },
};

configure({
  asyncUtilTimeout: config.waitforTimeout,
});
