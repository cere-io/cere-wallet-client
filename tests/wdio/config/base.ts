import * as path from 'path';
import historyApiMiddleware from 'express-history-api-fallback';
import { configure } from '@testing-library/webdriverio';

import { options } from './options';

const rootDir = path.resolve(__dirname, '../../..');
const bundleRoot = path.resolve(rootDir, 'build');

const chromeArgs = ['--window-size=1920,1080', '--disable-dev-shm-usage', '--no-sandbox', '--mute-audio'];

if (options.headless) {
  chromeArgs.push('--headless', '--disable-gpu');
}

export const chromeCapability: WebDriver.DesiredCapabilities = {
  browserName: 'chrome',
  acceptInsecureCerts: true,

  'goog:chromeOptions': {
    args: chromeArgs,
  },

  'selenoid:options': {
    /**
     * The hardcoded IP address is the address of GitHub actions host
     *
     * TODO: Figure out a better way to dected CI host IP, insted of hardcoding this one
     */
    hostsEntries: ['host.docker.internal:172.17.0.1'],
  },
};

export const config: WebdriverIO.Config = {
  runner: 'local',
  baseUrl: 'http://localhost:4567/',
  specs: ['./specs/**/*.ts'],
  capabilities: [chromeCapability],

  logLevel: 'warn',
  maxInstances: 10,

  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
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
    ],
  ],

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
    timeout: 60000,
    require: [require.resolve('mocha-steps')],
  },

  before: (capabilities, specs) => {
    require('./setup');
  },
};

configure({
  asyncUtilTimeout: config.waitforTimeout,
});
