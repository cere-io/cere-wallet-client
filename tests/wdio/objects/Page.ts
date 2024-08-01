export class Page {
  constructor(readonly url: string) {}

  async open() {
    await browser.url(this.url);
    await browser.waitUntil(() => browser.execute(() => document.readyState === 'complete'), {
      timeoutMsg: `Page ${this.url} failed to load in time`,
    });

    /**
     * Wait for the page to stabilize to fix flaky tests on CI
     * TODO: figure out a better way to handle this
     */
    await browser.pause(500);
  }
}
