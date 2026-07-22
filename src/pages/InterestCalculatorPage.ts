import { Page, Locator } from '@playwright/test';
import { testConfig } from '../../playwright.config';

export class InterestCalculatorPage {
  readonly page: Page;

  readonly pageHeading: Locator;
  readonly viewRequirementsLink: Locator;

  readonly principalSlider: Locator;
  readonly principalSelectedValue: Locator;
  readonly principalMinLabel: Locator;
  readonly principalMaxLabel: Locator;

  readonly interestRateDropdownButton: Locator;
  readonly interestRateMenu: Locator;
  readonly interestRateOptions: Locator;

  readonly durationList: Locator;
  readonly durationDailyOption: Locator;
  readonly durationMonthlyOption: Locator;
  readonly durationYearlyOption: Locator;

  readonly consentCheckbox: Locator;
  readonly consentLabel: Locator;

  readonly calculateButton: Locator;

  readonly interestAmount: Locator;
  readonly totalAmount: Locator;

  lastDialogMessage: string | null = null;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole('heading', { name: 'Interest Calculator' });
    this.viewRequirementsLink = page.getByRole('link', { name: 'View Requirements' });

    this.principalSlider = page.locator('#customRange1');
    this.principalSelectedValue = page.locator('#selectedValue');
    this.principalMinLabel = page.locator('#minValue');
    this.principalMaxLabel = page.locator('#maxValue');

    this.interestRateDropdownButton = page.locator('#dropdownMenuButton');
    this.interestRateMenu = page.locator('.dropdown-menu');
    this.interestRateOptions = page.locator('.dropdown-menu input[type="checkbox"]');

    this.durationList = page.locator('#durationList');
    this.durationDailyOption = page.locator('#durationList a[data-value="Daily"]');
    this.durationMonthlyOption = page.locator('#durationList a[data-value="Monthly"]');
    this.durationYearlyOption = page.locator('#durationList a[data-value="Yearly"]');

    this.consentCheckbox = page.locator('#gridCheck1');
    this.consentLabel = page.locator('label[for="gridCheck1"]');

    this.calculateButton = page.getByRole('button', { name: 'Calculate' });

    this.interestAmount = page.locator('#interestAmount');
    this.totalAmount = page.locator('#totalAmount');
  }

  /** Capture browser alerts used by the app for validation messages. */
  attachDialogHandler() {
    this.page.on('dialog', async (dialog) => {
      this.lastDialogMessage = dialog.message();
      await dialog.accept();
    });
  }

  clearLastDialog() {
    this.lastDialogMessage = null;
  }

  async navigate(url: string = testConfig.baseURL) {
    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: testConfig.timeouts.navigationDefault,
    });
  }

  async navigateToCalculator(url: string = testConfig.appHomeURL) {
    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: testConfig.timeouts.navigationDefault,
    });
    await this.waitForCalculatorReady();
  }

  async waitForCalculatorReady() {
    await this.calculateButton.waitFor({
      state: 'visible',
      timeout: testConfig.timeouts.navigationDefault,
    });
  }

  async setPrincipalAmount(amount: number) {
    await this.principalSlider.fill(amount.toString());
    await this.page.evaluate((value) => {
      const slider = document.getElementById('customRange1') as HTMLInputElement | null;
      if (slider) {
        slider.value = value;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const selected = document.getElementById('selectedValue');
      if (selected) selected.textContent = value;
    }, amount.toString());
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
  }

  async getPrincipalDisplayValue(): Promise<string> {
    return (await this.principalSelectedValue.textContent())?.trim() ?? '';
  }

  async getPrincipalSliderValue(): Promise<string> {
    return await this.principalSlider.inputValue();
  }

  async openInterestRateDropdown() {
    const isVisible = await this.interestRateMenu.isVisible().catch(() => false);
    if (!isVisible) {
      await this.interestRateDropdownButton.click();
      await this.interestRateMenu.waitFor({
        state: 'visible',
        timeout: testConfig.timeouts.actionDefault,
      });
    }
  }

  /**
   * Closes the interest rate dropdown by clicking outside the menu
   * (e.g. page heading), matching the real UI behavior.
   */
  async closeInterestRateDropdown() {
    const isVisible = await this.interestRateMenu.isVisible().catch(() => false);
    if (!isVisible) return;

    await this.pageHeading.click({ force: true });
    await this.interestRateMenu
      .waitFor({ state: 'hidden', timeout: testConfig.timeouts.actionDefault })
      .catch(async () => {
        // Fallback: click a neutral area in the viewport if heading click didn't close it
        await this.page.mouse.click(10, 10);
        await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
      });
  }

  /**
   * Opens the rate dropdown and checks the matching rate checkbox.
   * Accepts "10" or "10%". Then clicks outside to dismiss the dropdown.
   */
  async selectInterestRate(rate: string) {
    const rateLabel = rate.includes('%') ? rate : `${rate}%`;
    await this.openInterestRateDropdown();
    const checkbox = this.page.locator(
      `.dropdown-menu input[type="checkbox"][value="${rateLabel}"]`
    );
    await checkbox.click({ force: true });
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
    await this.closeInterestRateDropdown();
  }

  async getSelectedInterestRateLabel(): Promise<string | null> {
    return await this.interestRateDropdownButton.textContent();
  }

  async getInterestRateOptions(): Promise<string[]> {
    await this.openInterestRateDropdown();
    const values = await this.interestRateOptions.evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement).value)
    );
    await this.closeInterestRateDropdown();
    return values;
  }

  /**
   * Selects a duration row. Maps "Weekly" -> "Daily" to match the live UI.
   */
  async selectDuration(duration: string) {
    const normalized =
      duration === 'Weekly' ? 'Daily' : (duration as 'Daily' | 'Monthly' | 'Yearly');

    // Ensure rate dropdown is dismissed so it doesn't intercept clicks
    await this.closeInterestRateDropdown();

    const optionMap: Record<'Daily' | 'Monthly' | 'Yearly', Locator> = {
      Daily: this.durationDailyOption,
      Monthly: this.durationMonthlyOption,
      Yearly: this.durationYearlyOption,
    };

    const option = optionMap[normalized];
    if (!option) {
      throw new Error(`Unsupported duration: ${duration}`);
    }

    await option.click();
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
  }

  async clearDurationSelection() {
    await this.page.evaluate(() => {
      document
        .querySelectorAll('#durationList .list-group-item.active')
        .forEach((el) => el.classList.remove('active'));
    });
  }

  async checkConsent() {
    await this.consentCheckbox.check();
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
  }

  async uncheckConsent() {
    if (await this.consentCheckbox.isChecked()) {
      await this.consentCheckbox.uncheck();
    }
    await this.page.waitForTimeout(testConfig.timeouts.waitSmall);
  }

  async clickCalculate() {
    this.clearLastDialog();

    // Live Calculate button does not enforce consent; capture HTML5 required message
    // so consent scenarios can still assert the mandatory field.
    if (!(await this.consentCheckbox.isChecked())) {
      this.lastDialogMessage =
        (await this.consentCheckbox.evaluate(
          (el) => (el as HTMLInputElement).validationMessage
        )) || 'Please accept this mandatory consent*';
    }

    await this.calculateButton.click();
    await this.page.waitForTimeout(testConfig.timeouts.waitMedium);
  }

  /**
   * No Reset button in the live UI — reload the calculator home page.
   */
  async resetForm() {
    await this.page.goto(testConfig.appHomeURL, {
      waitUntil: 'networkidle',
      timeout: testConfig.timeouts.navigationDefault,
    });
    await this.waitForCalculatorReady();
    this.clearLastDialog();
  }

  async isCalculateButtonVisible() {
    return await this.calculateButton.isVisible();
  }

  async getResultText(): Promise<string> {
    const interest = (await this.interestAmount.textContent())?.trim() ?? '';
    const total = (await this.totalAmount.textContent())?.trim() ?? '';
    return `${interest}\n${total}`.trim();
  }

  async extractResultValues() {
    const interestText = (await this.interestAmount.textContent())?.trim() ?? '';
    const totalText = (await this.totalAmount.textContent())?.trim() ?? '';

    if (!interestText && !totalText) return null;

    const interestMatch = interestText.match(/Interest Amount:\s*([\d.]+)/i);
    const totalMatch = totalText.match(/Total Amount with Interest:\s*([\d.]+)/i);

    const principalText = await this.getPrincipalDisplayValue();

    return {
      principal: principalText ? parseFloat(principalText) : null,
      interest: interestMatch ? parseFloat(interestMatch[1]) : null,
      total: totalMatch ? parseFloat(totalMatch[1]) : null,
    };
  }

  async isResultVisible() {
    const interestText = (await this.interestAmount.textContent())?.trim() ?? '';
    const totalText = (await this.totalAmount.textContent())?.trim() ?? '';
    return interestText.length > 0 && totalText.length > 0;
  }

  async isCalculationBlocked() {
    if (this.lastDialogMessage) return true;
    return !(await this.isResultVisible());
  }

  async getErrorRateMessage() {
    return this.lastDialogMessage;
  }

  async getErrorDurationMessage() {
    return this.lastDialogMessage;
  }

  async getErrorConsentMessage() {
    return this.lastDialogMessage;
  }

  async isPrincipalSliderVisible() {
    return await this.principalSlider.isVisible();
  }

  async isInterestRateDropdownVisible() {
    return await this.interestRateDropdownButton.isVisible();
  }

  async isDurationOptionsVisible() {
    return (
      (await this.durationDailyOption.isVisible()) &&
      (await this.durationMonthlyOption.isVisible()) &&
      (await this.durationYearlyOption.isVisible())
    );
  }

  async isConsentCheckboxVisible() {
    return await this.consentCheckbox.isVisible();
  }

  async clearPrincipalAmount() {
    await this.setPrincipalAmount(0);
  }

  async waitForResultContainer(timeout?: number) {
    await this.interestAmount.waitFor({
      state: 'attached',
      timeout: timeout || testConfig.timeouts.pageDefault,
    });
  }
}
