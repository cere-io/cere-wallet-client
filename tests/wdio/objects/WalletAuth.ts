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

  get otpInput() {
    return $('.MuiStack-root input');
  }

  async enterRandomEmail() {
    const emailSuffix = Math.random().toString(32).slice(2);
    const email = `autotests+${emailSuffix}@cere.io`;

    await this.emailInput.setValue(email);

    return email;
  }

  async enterOTP(otp: string) {
    const inputs = await $$('.MuiStack-root input');

    if (inputs.length === 1) {
      await inputs[0].setValue(otp);
    } else if (inputs.length >= otp.length) {
      for (let i = 0; i < otp.length; i++) {
        await inputs[i].setValue(otp[i]);
      }
    } else {
      await browser.execute((otpValue) => {
        const otpInputs = document.querySelectorAll('.MuiStack-root input');
        otpInputs.forEach((input, index) => {
          if (index < otpValue.length) {
            // @ts-ignore
            input.value = otpValue[index];
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
      }, otp);
    }
  }
}
