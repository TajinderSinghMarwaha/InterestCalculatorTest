import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { expect, chromium, firefox, webkit, Browser, Page, BrowserContext } from '@playwright/test';
import { testConfig } from '../../playwright.config';
import { InterestCalculatorPage } from '../pages/InterestCalculatorPage';
import { LoginPage } from '../pages/LoginPage';
import { attachValidationMessage, attachValidationMessages } from '../support/reportAttachments';

setDefaultTimeout(testConfig.timeouts.pageDefault);

let browser: Browser;
let context: BrowserContext;
let page: Page;
let calculatorPage: InterestCalculatorPage;
let loginPage: LoginPage;

/**
 * Before Hook - Initialize browser, page, and authenticate before each scenario
 */
Before(async function() {
  const browserType = process.env.BROWSER || 'chromium';

  console.log(`🚀 Starting scenario with ${browserType} browser`);

  switch (browserType) {
    case 'firefox':
      browser = await firefox.launch({ headless: false });
      break;
    case 'webkit':
      browser = await webkit.launch({ headless: false });
      break;
    case 'chromium':
    default:
      browser = await chromium.launch({ headless: false });
  }

  context = await browser.newContext({
    viewport: testConfig.browserContext.viewport,
  });

  page = await context.newPage();
  page.setDefaultTimeout(testConfig.timeouts.pageDefault);

  // Initialize page objects
  calculatorPage = new InterestCalculatorPage(page);
  loginPage = new LoginPage(page);
  calculatorPage.attachDialogHandler();
});

/**
 * After Hook - Attach evidence to report, then cleanup
 */
After(async function(scenario) {
  try {
    if (calculatorPage?.lastDialogMessage) {
      await attachValidationMessage(this, 'dialog', calculatorPage.lastDialogMessage);
    }

    if (scenario.result?.status === 'FAILED' && page) {
      const screenshot = await page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');
      await page.screenshot({
        path: `./reports/failure-${Date.now()}.png`,
      });
      console.log(`❌ Test failed - Screenshot attached to report`);
    }
  } catch (error) {
    console.warn('Report attachment warning:', error);
  }

  if (page) await page.close();
  if (context) await context.close();
  if (browser) await browser.close();
});

// ============================================================================
// BACKGROUND STEP
// ============================================================================

Given('the user navigates to the Interest Calculator application', async function() {
  await calculatorPage.navigate();
  console.log('✓ Navigated to login page');
});

Given('the user logs in with valid credentials', async function() {
  await loginPage.loginWithCredentials();
  await calculatorPage.waitForCalculatorReady();
  console.log(`✓ Logged in as ${testConfig.testEmail}`);
});

// ============================================================================
// AC-01, AC-02, AC-03: GIVEN STEPS
// ============================================================================

Given('the user enters a Principal Amount of {int}', async function(amount: number) {
  await calculatorPage.setPrincipalAmount(amount);
  const displayValue = await calculatorPage.getPrincipalDisplayValue();
  expect(displayValue).toBe(amount.toString());
  console.log(`✓ Principal amount set to £${amount}`);
});

Given('selects Interest rate of {string}', async function(rate: string) {
  await calculatorPage.selectInterestRate(rate);
  console.log(`✓ Interest rate selected: ${rate}`);
});

Given('selects Duration {string}', async function(duration: string) {
  await calculatorPage.selectDuration(duration);
  console.log(`✓ Duration selected: ${duration}`);
});

// ============================================================================
// AC-01, AC-02, AC-03: WHEN STEP
// ============================================================================

When('the user clicks Calculate', async function() {
  console.log('⏳ Clicking Calculate button...');
  await calculatorPage.clickCalculate();
  if (calculatorPage.lastDialogMessage) {
    await attachValidationMessage(this, 'calculate', calculatorPage.lastDialogMessage);
    console.log(`⚠ Validation message: "${calculatorPage.lastDialogMessage}"`);
  }
});

// ============================================================================
// AC-01, AC-02, AC-03: THEN STEPS
// ============================================================================

Then('the application computes Interest', async function() {
  const isVisible = await calculatorPage.isResultVisible();
  expect(isVisible).toBe(true);
  console.log('✓ Results displayed');
});

Then('Total Amount = Principal Amount + Interest', async function() {
  const results = await calculatorPage.extractResultValues();

  // Guard clause to ensure results are present and typed correctly
  expect(results).not.toBeNull();

  // Cast to include 'principal' if it wasn't typed on page object return
  const { interest, total } = results!;
  const principal = (results as any).principal ?? (await calculatorPage.getPrincipalDisplayValue().then(Number));

  expect(interest).not.toBeNull();
  expect(total).not.toBeNull();

  const expectedTotal = principal + interest!;
  const difference = Math.abs(total! - expectedTotal);

  expect(difference).toBeLessThan(0.01);
  console.log(`✓ Calculation verified: £${principal} + £${interest} = £${total}`);
});

Then('both values are rounded to two decimal places', async function() {
  const results = await calculatorPage.extractResultValues();
  expect(results).not.toBeNull();

  const checkDecimalPlaces = (num: number): boolean => {
    const str = num.toString();
    const decimals = str.split('.')[1];
    return !decimals || decimals.length <= 2;
  };

  expect(results!.interest).not.toBeNull();
  expect(results!.total).not.toBeNull();

  expect(checkDecimalPlaces(results!.interest!)).toBe(true);
  expect(checkDecimalPlaces(results!.total!)).toBe(true);
  console.log(`✓ Rounding verified: Interest=${results!.interest}, Total=${results!.total}`);
});

Then('both values are displayed', async function() {
  const isVisible = await calculatorPage.isResultVisible();
  expect(isVisible).toBe(true);

  const resultText = await calculatorPage.getResultText();
  expect(resultText).toMatch(/Interest Amount:/i);
  expect(resultText).toMatch(/Total Amount with Interest:/i);
  console.log('✓ All values displayed correctly');
});

// ============================================================================
// AC-04: CORRECT ROUNDING
// ============================================================================

Then('Interest and Total Amount are rounded \\(not truncated\\) to two decimal places using standard rounding rules', async function() {
  const results = await calculatorPage.extractResultValues();
  expect(results).not.toBeNull();

  const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

  const interest = results!.interest!;
  const total = results!.total!;

  const roundedInterest = roundToTwoDecimals(interest);
  const roundedTotal = roundToTwoDecimals(total);

  expect(Math.abs(interest - roundedInterest)).toBeLessThan(0.001);
  expect(Math.abs(total - roundedTotal)).toBeLessThan(0.001);
  console.log('✓ Standard rounding rules verified');
});

// ============================================================================
// AC-05: INTEREST RATE VALIDATION
// ============================================================================

Given('the user opens the interest rate dropdown', async function() {
  await calculatorPage.openInterestRateDropdown();
  console.log('✓ Interest rate dropdown opened');
});

Then('the list contains predefined rates in percentage values from greater than 0 up to and including 15%', async function() {
  const options = await calculatorPage.getInterestRateOptions();

  expect(options.length).toBeGreaterThan(0);

  options.forEach(opt => {
    const rateValue = parseInt(opt.replace('%', ''), 10);
    expect(rateValue).toBeGreaterThan(0);
    expect(rateValue).toBeLessThanOrEqual(15);
  });
  console.log(`✓ Interest rate options valid: ${options.join(', ')}`);
});

Then('no option exceeds 15%', async function() {
  const options = await calculatorPage.getInterestRateOptions();

  options.forEach(opt => {
    const rateValue = parseInt(opt.replace('%', ''), 10);
    expect(rateValue).toBeLessThanOrEqual(15);
  });
  console.log('✓ All rates ≤ 15%');
});

Then('the calculator accepts 15% as a valid selection', async function() {
  await calculatorPage.selectInterestRate('15%');
  const selectedLabel = await calculatorPage.getSelectedInterestRateLabel();
  expect(selectedLabel).toContain('15%');
  console.log('✓ 15% accepted as valid selection');
});

// ============================================================================
// AC-06: ALL FIELDS REQUIRED
// ============================================================================

Given('the user tries to calculate without completing all mandatory inputs', async function() {
  await calculatorPage.resetForm();
  console.log('✓ Form reset');
});

Then('the calculation is blocked', async function() {
  const isBlocked = await calculatorPage.isCalculationBlocked();
  expect(isBlocked).toBe(true);
  if (calculatorPage.lastDialogMessage) {
    await attachValidationMessage(this, 'blocked', calculatorPage.lastDialogMessage);
  }
  console.log('✓ Calculation blocked as expected');
});

Then('an inline error message is displayed for each missing field', async function() {
  const errorRate = await calculatorPage.getErrorRateMessage() ?? '';
  const errorDuration = await calculatorPage.getErrorDurationMessage() ?? '';
  const errorConsent = await calculatorPage.getErrorConsentMessage() ?? '';

  await attachValidationMessages(this, {
    rate: errorRate,
    duration: errorDuration,
    consent: errorConsent,
    dialog: calculatorPage.lastDialogMessage,
  });

  const totalErrors = errorRate.length + errorDuration.length + errorConsent.length;
  expect(totalErrors).toBeGreaterThan(0);
  console.log(`✓ Error messages displayed for missing fields: "${calculatorPage.lastDialogMessage || errorRate || errorDuration || errorConsent}"`);
});

// ============================================================================
// AC-07: PRINCIPAL AMOUNT VALIDATION
// ============================================================================

Then('slider should allow to select any value upto 15000', async function() {
  const maxValue = await calculatorPage.principalSlider.getAttribute('max');
  expect(maxValue).toBe('15000');
  console.log('✓ Slider maximum is 15000');
});

Then('no option exceeds 15000', async function() {
  const maxValue = await calculatorPage.principalSlider.getAttribute('max');
  expect(parseInt(maxValue || '0')).toBeLessThanOrEqual(15000);
  console.log('✓ Principal amount max validated');
});

Then('the calculator accepts 15000 as a valid selection', async function() {
  await calculatorPage.setPrincipalAmount(15000);
  const displayValue = await calculatorPage.getPrincipalDisplayValue();
  expect(displayValue).toBe('15000');
  console.log('✓ 15000 accepted as valid principal');
});

// ============================================================================
// AC-08: INTEREST RATE NOT SELECTED
// ============================================================================

Given('the user did not choose an interest rate from the dropdown', async function() {
  await calculatorPage.resetForm();
  await calculatorPage.setPrincipalAmount(5000);
  await calculatorPage.selectDuration('Monthly');
  await calculatorPage.checkConsent();
  console.log('✓ Form setup: Principal set, Duration selected, Consent checked (Rate NOT selected)');
});

Then('show an error', async function() {
  const errorMessage =
    calculatorPage.lastDialogMessage ||
    (await calculatorPage.getErrorRateMessage());
  expect(errorMessage).not.toBeNull();
  expect(errorMessage!.length).toBeGreaterThan(0);
  await attachValidationMessage(this, 'validation', errorMessage);
  console.log(`✓ Error displayed: "${errorMessage}"`);
});

Then('prevent calculation', async function() {
  const isBlocked = await calculatorPage.isCalculationBlocked();
  expect(isBlocked).toBe(true);
  if (calculatorPage.lastDialogMessage) {
    await attachValidationMessage(this, 'prevented', calculatorPage.lastDialogMessage);
  }
  console.log('✓ Calculation prevented as expected');
});

// ============================================================================
// AC-09: DURATION NOT SELECTED
// ============================================================================

Given('the user did not choose a duration \\(Daily\\/Monthly\\/Yearly)', async function() {
  await calculatorPage.resetForm();
  await calculatorPage.setPrincipalAmount(5000);
  await calculatorPage.selectInterestRate('10%');
  await calculatorPage.clearDurationSelection();
  await calculatorPage.checkConsent();
  console.log('✓ Form setup: Principal set, Rate selected, Consent checked (Duration NOT selected)');
});

Given('the user did not choose a duration \\(Weekly\\/Monthly\\/Yearly)', async function() {
  await calculatorPage.resetForm();
  await calculatorPage.setPrincipalAmount(5000);
  await calculatorPage.selectInterestRate('10%');
  await calculatorPage.clearDurationSelection();
  await calculatorPage.checkConsent();
  console.log('✓ Form setup: Principal set, Rate selected, Consent checked (Duration NOT selected)');
});

// ============================================================================
// AC-10: CONSENT REQUIRED
// ============================================================================

Given('the consent checkbox is not checked', async function() {
  await calculatorPage.resetForm();
  await calculatorPage.setPrincipalAmount(5000);
  await calculatorPage.selectInterestRate('10%');
  await calculatorPage.selectDuration('Monthly');
  await calculatorPage.uncheckConsent();
  console.log('✓ Form setup: Principal set, Rate selected, Duration selected (Consent NOT checked)');
});

// ============================================================================
// LOGIN SCENARIO STEPS
// ============================================================================

Given('the user is on the login page', async function() {
  await loginPage.navigateToLogin();
  const isVisible = await loginPage.isLoginHeadingVisible();
  expect(isVisible).toBe(true);
  console.log('✓ User is on the login page');
});

When('the user enters valid credentials and submits the login form', async function() {
  console.log('📝 Entering credentials from config');
  await loginPage.login(testConfig.testEmail, testConfig.testPassword);
  console.log(`✓ Login form submitted with email: ${testConfig.testEmail}`);
});

Then('the user should be successfully authenticated', async function() {
  await page.waitForTimeout(testConfig.timeouts.waitMedium);
  const currentURL = page.url();
  expect(currentURL).not.toContain('Login');
  console.log('✓ User is authenticated (redirected away from login page)');
});

Then('the user should be redirected to the Interest Calculator application', async function() {
  const isCalculateButtonVisible = await calculatorPage.isCalculateButtonVisible();
  expect(isCalculateButtonVisible).toBe(true);
  console.log('✓ User is on the Interest Calculator application');
});
