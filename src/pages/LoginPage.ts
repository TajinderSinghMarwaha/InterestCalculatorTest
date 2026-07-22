import { Page, Locator } from '@playwright/test';
import { testConfig } from '../../playwright.config';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly loginHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#UserName');
    this.passwordInput = page.locator('#Password');
    this.rememberMeCheckbox = page.locator('#RememberMe');
    this.loginButton = page.locator('button:has-text("Log in")');
    this.loginHeading = page.locator('text=Please enter your login credentails');
  }

  async navigateToLogin(url: string = testConfig.baseURL) {
    await this.page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: testConfig.timeouts.navigationDefault 
    });
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
  }

  async checkRememberMe() {
    await this.rememberMeCheckbox.check();
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
  }

  async clickLoginButton() {
    await this.loginButton.click();
    await this.page.waitForTimeout(testConfig.timeouts.waitMedium);
  }

  async login(email: string, password: string) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLoginButton();
    await this.page.waitForURL(
      (url) => !url.pathname.includes('/Account/Login'),
      { timeout: testConfig.timeouts.navigationDefault }
    );
  }

  async loginWithCredentials() {
    await this.login(testConfig.testEmail, testConfig.testPassword);
  }

  async isLoginHeadingVisible(): Promise<boolean> {
    return await this.loginHeading.isVisible();
  }

  async isLoginButtonVisible(): Promise<boolean> {
    return await this.loginButton.isVisible();
  }
}
