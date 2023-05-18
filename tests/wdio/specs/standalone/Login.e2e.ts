import { CereWalletAuth } from '../../objects';

describe('Standalone login', () => {
  const walletAuth = new CereWalletAuth();

  before(async () => {
    await browser.url('/');
  });

  step('start new wallet creation', async () => {
    await walletAuth.newWalletButton.click();
  });

  step('enter email and proceed', async () => {
    await walletAuth.enterRandomEmail();
    await walletAuth.signUpButton.click();
  });

  step('enter OTP and proceed', async () => {
    await walletAuth.enterOTP('555555');
    await walletAuth.verifyButton.click();
  });

  it('should redirect to the home page', async () => {
    await expect(browser).toHaveUrlContaining('/wallet/home', {
      wait: 30000,
    });
  });
});
