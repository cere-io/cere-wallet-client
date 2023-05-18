export class CereWalletAuth {
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

  async enterRandomEmail() {
    const emailSuffix = Math.random().toString(32).slice(2);

    await this.emailInput.setValue(`auto+${emailSuffix}@test.io`);
  }

  async enterOTP(otp: string) {
    await $('.react-code-input').waitForDisplayed();

    const inputs = await browser.$$('.react-code-input input');

    return Promise.all(inputs.map((input, index) => input.setValue(otp[index])));
  }
}
