import reporter from '@wdio/allure-reporter';
import { WalletAuth, WalletHome } from '../../objects';

describe('Standalone login', () => {
  const walletAuth = new WalletAuth();
  const walletHome = new WalletHome();

  const currentUser = {
    email: '',
    ethAddress: '',
    cereAddress: '',
  };

  before(async () => {
    await browser.url('/');
  });

  step('start new wallet creation', async () => {
    await walletAuth.newWalletButton.click();
  });

  step('enter email and proceed', async () => {
    currentUser.email = await walletAuth.enterRandomEmail();

    await walletAuth.signUpButton.click();
  });

  step('enter OTP and proceed', async () => {
    await walletAuth.enterOTP('555555');
    await walletAuth.verifyButton.click();

    await expect(browser).toHaveUrlContaining(walletHome.pageUrl, {
      wait: 2 * 60 * 1000, // Wait for up to 2 mins to get proper network errors (eg: 504)
    });
  });

  it('should connect the wallet', async () => {
    await walletHome.switchAddressButton.click();

    currentUser.ethAddress = await walletHome.readAddress('Polygon');
    currentUser.cereAddress = await walletHome.readAddress('Cere Network');

    expect(currentUser.cereAddress).toBeTruthy();
    expect(currentUser.ethAddress).toBeTruthy();

    reporter.addAttachment('Wallet details', JSON.stringify(currentUser, null, 2), 'application/json');
  });
});
