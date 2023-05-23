export class WalletHome {
  readonly pageUrl = '/wallet/home';

  get switchAddressButton() {
    return browser.findByRole$('button', { name: 'Switch address' });
  }

  get addressDropdown() {
    return browser.findByRole$('menu', { name: 'Address dropdown' });
  }

  async readAddress(chain: 'Cere Network' | 'Polygon') {
    const addressElement = await this.addressDropdown.findByLabelText$(chain).findByLabelText$('Wallet address');

    return addressElement.getAttribute('data-full');
  }
}
