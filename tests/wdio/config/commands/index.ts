/**
 * Custom commands
 */

browser.addCommand('readClipboard', async () => {
  await browser.setPermissions({ name: 'clipboard-read' }, 'granted');

  return browser.execute(() => navigator.clipboard.readText());
});
