import { Page } from './Page';

export class WalletAuth extends Page {
  constructor() {
    super('/');
  }

  get newWalletButton() {
    return browser.findByRole$('button', { name: 'Create a new wallet' });
  }

  get emailInput() {
    return browser.findByRole$('textbox', { name: 'Email' });
  }

  get signUpButton() {
    return browser.findByRole$('button', { name: 'Sign Up' });
  }

  get verifyButton() {
    return browser.findByRole$('button', { name: 'Verify' });
  }

  get otpContainer() {
    return browser.$('#otp_block');
  }

  async enterRandomEmail() {
    const emailSuffix = Math.random().toString(32).slice(2);
    const email = `autotests+${emailSuffix}@cere.io`;

    await this.emailInput.setValue(email);

    return email;
  }

  async enterOTP(otp: string) {
    await browser.waitUntil(
      async () => (await browser.getUrl()).includes('/otp'),
      { timeout: 30000, timeoutMsg: 'OTP page URL not reached within 30s' },
    );
    await this.otpContainer.waitForDisplayed({ timeout: 30000 });
    await this.otpContainer.click();
    await browser.keys(otp.split(''));
  }
}
