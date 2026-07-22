/*
import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { testConfig } from '../../playwright.config';

setDefaultTimeout(30 * 1000);

let browser: Browser;
let context: BrowserContext;
let page: Page;

/!**
 * Before Hook - Initialize browser and page
 * Runs before each scenario
 *!/
Before(async function() {
  const browserType = process.env.BROWSER || 'chromium';
  
  console.log(`🌐 Launching ${browserType} browser...`);
  
  const launchOptions = {
    headless: false,
    args: testConfig.browserLaunchArgs,
  };

  switch (browserType) {
    case 'firefox':
      browser = await firefox.launch(launchOptions);
      break;
    case 'webkit':
      browser = await webkit.launch(launchOptions);
      break;
    case 'chromium':
    default:
      browser = await chromium.launch(launchOptions);
  }

  console.log(`✅ ${browserType} browser launched`);

  // Create browser context with configuration from testConfig
  context = await browser.newContext({
    viewport: testConfig.browserContext.viewport,
    ignoreHTTPSErrors: testConfig.browserContext.ignoreHTTPSErrors,
  });

  console.log(`✅ Browser context created with viewport ${testConfig.browserContext.viewport.width}x${testConfig.browserContext.viewport.height}`);

  // Create new page
  page = await context.newPage();

  // Set default timeout for page operations
  page.setDefaultTimeout(testConfig.timeouts.pageDefault);
  page.setDefaultNavigationTimeout(testConfig.timeouts.navigationDefault);

  // Navigate to the application URL from config
  console.log(`📍 Navigating to: ${testConfig.appUrl}`);
  try {
    await page.goto(testConfig.appUrl, { 
      waitUntil: 'networkidle',
      timeout: testConfig.timeouts.navigationDefault
    });
    console.log(`✅ Successfully navigated to application`);
  } catch (error: any) {
    console.error(`❌ Failed to navigate to application: ${error.message}`);
    console.log(`📌 Make sure the application is running at: ${testConfig.appUrl}`);
    throw error;
  }

  // Store in context for access in step definitions
  this.browser = browser;
  this.context = context;
  this.page = page;

  console.log(`✅ Browser and page initialized successfully\n`);
});

/!**
 * After Hook - Cleanup after scenario
 * Runs after each scenario
 *!/
After(async function(scenario) {
  console.log(`\n📋 Scenario: ${scenario.pickle.name}`);
  console.log(`Status: ${scenario.result?.status}`);

  // Take screenshot on failure
  if (scenario.result?.status === 'FAILED') {
    console.log('📸 Taking screenshot of failure...');
    const screenshot = await page.screenshot({
      path: `./reports/failure-${Date.now()}.png`,
    });
    console.log('Screenshot saved to reports/');
  }

  // Close page
  if (page) {
    await page.close();
    console.log('🔒 Page closed');
  }

  // Close context
  if (context) {
    await context.close();
    console.log('🔒 Context closed');
  }

  // Close browser
  if (browser) {
    await browser.close();
    console.log('🔒 Browser closed');
  }

  console.log('✅ Cleanup completed\n');
});

export { page, browser, context };
*/
