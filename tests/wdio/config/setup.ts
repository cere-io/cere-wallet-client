import { setupBrowser, WebdriverIOQueriesChainable, WebdriverIOQueries } from '@testing-library/webdriverio';
import { step as stepFunction, xstep as xstepFunction } from 'mocha-steps';

declare global {
  const step: typeof stepFunction;
  const xstep: typeof xstepFunction;

  namespace WebdriverIO {
    interface Browser extends WebdriverIOQueries, WebdriverIOQueriesChainable<Browser> {
      /**
       * Custom commands
       */
      readClipboard: () => Promise<string>;
    }

    interface Element extends WebdriverIOQueries, WebdriverIOQueriesChainable<Element> {}
  }
}

export const setup = async () => {
  /**
   * Add Testing Library commands
   */
  setupBrowser(browser);

  /**
   * Setup custom commands
   */
  require('./commands');
};
