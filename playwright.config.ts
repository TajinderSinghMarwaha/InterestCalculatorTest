import { defineConfig, devices } from '@playwright/test';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLAYWRIGHT TEST CONFIGURATION - SINGLE SOURCE OF TRUTH
 * ═══════════════════════════════════════════════════════════════════════════
 * All configuration values are defined here and exported for use throughout
 * the test framework. This ensures a single point of configuration management.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * APPLICATION CONFIGURATION
 * Update these values to configure the framework for different environments
 */
export const testConfig = {
  /**
   * Application URL where tests should connect
   * Update this URL to test different environments
   */
  baseURL: 'http://3.8.242.61/Account/Login',
  
  /**
   * Application Home URL (post-login)
   */
  appHomeURL: 'http://3.8.242.61',

  /**
   * Test Credentials
   * Update these credentials for your test environment
   */
  testEmail: 'singh.marwah@gmail.com',
  testPassword: 'Taji@236',

  /**
   * Browser Launch Arguments
   * These arguments remove security restrictions and improve localhost testing
   */
  browserLaunchArgs: [
    '--disable-web-resources',
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-popup-blocking',
    '--allow-file-access-from-files',
  ],

  /**
   * Browser Context Configuration
   * Settings applied to every browser context created during tests
   */
  browserContext: {
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
  },

  /**
   * Timeout Configuration (in milliseconds)
   * All timeout values used throughout the framework
   */
  timeouts: {
    pageDefault: 30000,
    navigationDefault: 30000,
    actionDefault: 10000,
    assertionDefault: 5000,
    waitSmall: 300,
    waitMedium: 1000,
    waitLarge: 3000,
  },
};

/**
 * PLAYWRIGHT TEST CONFIGURATION
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './features',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list'],
  ],
  use: {
    baseURL: testConfig.baseURL,
    ignoreHTTPSErrors: testConfig.browserContext.ignoreHTTPSErrors,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: testConfig.timeouts.actionDefault,
    navigationTimeout: testConfig.timeouts.navigationDefault,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  globalTimeout: 600000,
  timeout: testConfig.timeouts.pageDefault,
  expect: {
    timeout: testConfig.timeouts.assertionDefault,
  },
});
