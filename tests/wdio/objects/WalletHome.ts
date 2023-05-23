export class WalletHome {
  readonly pageUrl = '/wallet/home';

  get copyAddressButton() {
    return browser.findByRole$('button', { name: 'Copy to clipboard' });
  }

  get switchAddressButton() {
    return browser.findByRole$('button', { name: 'Switch address' });
  }

  get addressDropdown() {
    return browser.findByRole$('menu', { name: 'Address dropdown' });
  }

  async copyAddressAndReturn() {
    await this.copyAddressButton.click();

    return browser.readClipboard();
  }

  async switchAddress(to: 'Cere Network' | 'Polygon') {
    await this.switchAddressButton.click();
    await this.addressDropdown.findByLabelText$(to).click();

    /**
     * Hide overlay
     */
    await browser.findByRole$('presentation', { name: 'Overlay' }).click();
  }
}
