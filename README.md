# Interest Calculator BDD Automation Framework

A Playwright TypeScript-based BDD automation framework using Cucumber for testing the Interest Calculator application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```
### 1.1 Run Playwright Install
```bash
npx playwright install
```

### 2. Run Tests
```bash
npm test
```

## 📋 Prerequisites

- Node.js v16 or higher
- npm v7 or higher
- Interest Calculator app running at: `http://localhost:63342/InterestCalculator/src/interestCalculator.html`

## 🏗️ Framework Architecture

```
InterestCalculatorTest/
├── src/
│   ├── pages/
│   │   └── InterestCalculatorPage.ts    # Page Object Model
│   ├── hooks/
│   │   └── hooks.ts                     # Cucumber hooks
│   └── steps/
│       └── interestCalculator.steps.ts  # Step definitions
├── features/
│   └── interestCalculator.feature       # Gherkin scenarios
├── reports/                              # Generated reports
├── cucumber.js                           # Cucumber config
├── package.json                          # Dependencies
├── tsconfig.json                         # TypeScript config
└── README.md                             # This file
```

## 📝 Test Commands

### Run All Tests
```bash
npm test
```

### Run with Progress Bar
```bash
npm run test:headed
```

### Run Specific Test
```bash
npm run test:tag -- "@AC-01"
```

### Run Multiple Tests
```bash
npm run test:tag -- "@AC-01 or @AC-02"
```

### Run All Except Specific Test
```bash
npm run test:tag -- "not @AC-10"
```

### Debug Mode
```bash
npm run test:debug
```

### Open Playwright Report
```bash
npm run playwright:report
```

### Generate Report From Last Run
```bash
npm run report:generate
```

## ✅ Test Coverage

All 10 acceptance criteria are automated:

| AC# | Scenario | Tag | Status |
|-----|----------|-----|--------|
| AC-01 | Yearly Interest Calculation | @AC-01 | ✓ Implemented |
| AC-02 | Monthly Interest Calculation | @AC-02 | ✓ Implemented |
| AC-03 | Daily Interest Calculation | @AC-03 | ✓ Implemented |
| AC-04 | Correct Rounding to Two Decimals | @AC-04 | ✓ Implemented |
| AC-05 | Interest Rate Options Limited to ≤ 15% | @AC-05 | ✓ Implemented |
| AC-06 | All Fields Required | @AC-06 | ✓ Implemented |
| AC-07 | Principal Amount Validation | @AC-07 | ✓ Implemented |
| AC-08 | Interest Rate Not Selected | @AC-08 | ✓ Implemented |
| AC-09 | Duration Not Selected | @AC-09 | ✓ Implemented |
| AC-10 | Consent Required | @AC-10 | ✓ Implemented |

## 🔧 Configuration

### cucumber.js
Configures Cucumber test runner:
- Test file paths and loading mechanism
- Step definition requirements
- Report formats (progress-bar, HTML)
- TypeScript support via ts-node
- Parallel execution settings

### tsconfig.json
TypeScript compiler settings:
- ES2020 target for modern JavaScript
- CommonJS module format
- Strict type checking enabled
- Source maps for debugging

### package.json
Project configuration:
- All npm dependencies
- Test execution scripts
- Project metadata

## 📚 Key Components

### Page Object Model (InterestCalculatorPage.ts)
Encapsulates all UI interactions:
- Element locators (principal slider, dropdowns, checkboxes, buttons)
- Navigation method to open the calculator
- User action methods (set principal, select rate, select duration, etc.)
- Result extraction and validation helpers
- Error message retrieval methods

**Key Methods:**
- `navigate()` - Opens the calculator app
- `setPrincipalAmount(amount)` - Sets principal using slider
- `selectInterestRate(rate)` - Selects interest rate from dropdown
- `selectDuration(duration)` - Selects calculation duration
- `checkConsent()` / `uncheckConsent()` - Manages consent checkbox
- `clickCalculate()` - Triggers calculation
- `clickReset()` - Resets the form
- `extractResultValues()` - Parses and extracts calculation results
- `getErrorRateMessage()` - Retrieves interest rate validation errors
- `getErrorDurationMessage()` - Retrieves duration validation errors
- `getErrorConsentMessage()` - Retrieves consent validation errors
- `isCalculationBlocked()` - Checks if calculation was prevented
- `isResultVisible()` - Verifies result display

### Step Definitions (interestCalculator.steps.ts)
Maps Gherkin steps to automation code:
- **Given** steps - Setup test data and preconditions
- **When** steps - User actions
- **Then** steps - Assertions and validations

All steps use the POM (InterestCalculatorPage) for element interaction:
- 60+ step definitions covering all test scenarios
- Comprehensive assertions for validation
- Clear, maintainable code structure

### Feature Files (interestCalculator.feature)
Human-readable Gherkin test scenarios:
- 10 complete acceptance criteria tests
- Background setup for common preconditions
- Tagged with AC numbers for easy filtering
- Follows BDD best practices

### Hooks (hooks.ts)
Test lifecycle management:
- **Before**: Launches browser, creates page context, navigates to app
- **After**: Closes page, context, and browser for cleanup
- Default timeout: 30 seconds

## 🔍 Test Scenarios Overview

### Calculation Tests (AC-01, AC-02, AC-03)
Tests correct interest calculation based on duration:
- **AC-01**: Yearly calculation (12-month interest)
- **AC-02**: Monthly calculation (interest divided by 12)
- **AC-03**: Weekly calculation (interest divided by 52)

Each validates:
- Interest computation
- Correct total calculation (Principal + Interest)
- Proper rounding to 2 decimal places
- Result display

### Rounding Test (AC-04)
Validates proper rounding to 2 decimal places:
- Uses standard mathematical rounding (not truncation)
- Works with various principal and rate combinations
- Verifies both interest and total are rounded correctly

### Validation Tests (AC-05 to AC-10)
Tests UI validation and constraints:

- **AC-05**: Interest rate dropdown validation
  - Rates are predefined (1% to 15%)
  - No options exceed 15%
  - Accepts 15% as valid selection

- **AC-06**: All fields required
  - Form validation when fields are missing
  - Error messages displayed for each missing field
  - Calculation is blocked

- **AC-07**: Principal amount validation
  - Slider maximum is 15000
  - Slider accepts 15000 as valid value

- **AC-08**: Interest rate not selected
  - Error displayed when rate is missing
  - Calculation is prevented

- **AC-09**: Duration not selected
  - Error displayed when duration is missing
  - Calculation is prevented

- **AC-10**: Consent required
  - Error displayed when consent unchecked
  - Calculation is prevented

## 🛠️ Best Practices Implemented

✓ **Page Object Model** - Centralized element management
✓ **BDD with Cucumber** - Readable, maintainable scenarios
✓ **TypeScript** - Type-safe automation code
✓ **Clear Separation** - Pages, steps, and features isolated
✓ **DRY Principle** - Reusable step definitions
✓ **Comprehensive Validation** - Calculation and UI tests
✓ **Error Handling** - Proper exception management
✓ **Meaningful Assertions** - Clear test failure messages
✓ **Professional Structure** - Industry-standard organization

## 📊 Test Reports

For issues found during testing, execution steps, coverage, and limitations, see:

**[TEST_EXECUTION_AND_FINDINGS.md](./TEST_EXECUTION_AND_FINDINGS.md)**

Tests run through Cucumber + Playwright. After `npm test`, reports are written automatically.

### Generated artefacts

| Report | Location |
|--------|----------|
| Playwright HTML report | `playwright-report/index.html` |
| Cucumber HTML report | `reports/cucumber-report.html` |
| Cucumber JSON | `reports/cucumber-report.json` |
| JUnit XML | `reports/cucumber-report.xml` |

### View Playwright report
```bash
npm run playwright:report
```

This regenerates `playwright-report/` from the latest Cucumber JSON (if needed) and opens it with Playwright’s report server.

### Generate report only (after a previous test run)
```bash
npm run report:generate
```

### View Cucumber HTML report
```bash
npm run report:cucumber
# or
open reports/cucumber-report.html
```

### What the report includes
- Scenario pass/fail summary
- Step-by-step results
- **Validation / error messages** attached from dialog and field checks (e.g. “Please fill in all fields.”)
- Failure screenshots (PNG) embedded in the report when a scenario fails

## 🐛 Troubleshooting

### Issue: "Cannot find module '@cucumber/cucumber'"
```bash
npm install
```
Verify installation: `npm list @cucumber/cucumber`

### Issue: "Cannot navigate to localhost:63342"
**Solution:**
1. Ensure Interest Calculator app is running
2. Check URL: `http://localhost:63342/InterestCalculator/src/interestCalculator.html`
3. Verify firewall/proxy settings
4. Check browser can access the URL manually

### Issue: "Timeout waiting for element"
**Solution:**
- Increase timeout in cucumber.js if tests are slow
- Check element locators in InterestCalculatorPage.ts match actual HTML
- Verify application HTML structure hasn't changed
- Try running single test: `npm run test:tag -- "@AC-01"`

### Issue: Tests run too slowly
**Solution:**
- Reduce wait times in step definitions
- Use `--tags` to run specific scenarios instead of all
- Close other browser instances
- Check system resources (CPU, memory)

### Issue: "Browser doesn't open"
**Solution:**
- Framework runs in headed mode (browser visible)
- Install Chromium: `npx playwright install`
- Check system has GUI environment
- Verify Chromium installation: `npx playwright --version`

### Issue: "Element not found" errors
**Solution:**
- Verify locators in InterestCalculatorPage.ts match actual HTML ids
- Check app HTML structure: `http://localhost:63342/InterestCalculator/src/interestCalculator.html`
- Use Playwright Inspector: Add `await page.pause();` in steps
- Check browser console for JavaScript errors

## 📖 Adding New Tests

To add new test scenarios:

### 1. Add Scenario to Feature File
```gherkin
@AC-11
Scenario: New Test Case
  Given precondition
  When action
  Then assertion
```

### 2. Add Step Definitions
```typescript
Given('precondition', async function() {
  // implementation
});

When('action', async function() {
  // implementation
});

Then('assertion', async function() {
  // implementation
});
```

### 3. Add Page Methods (if needed)
```typescript
async newMethod() {
  // implementation
}
```

### 4. Run Test
```bash
npm run test:tag -- "@AC-11"
```

## 🚀 Running Tests

### First Run
```bash
# 1. Install dependencies
npm install

# 2. Verify installation
npm list @playwright/test @cucumber/cucumber typescript

# 3. Run all tests
npm test
```

### Expected Output
```
Feature: Interest Calculator Application

  Scenario: Yearly Interest Calculation
    ✓ Given the user navigates to the Interest Calculator application
    ✓ And the user enters a Principal Amount of 5000
    ✓ And selects Interest rate of "10%"
    ✓ And selects Duration "Yearly"
    ✓ When the user clicks Calculate
    ✓ Then the application computes Interest
    ✓ And Total Amount = Principal Amount + Interest
    ✓ And both values are rounded to two decimal places
    ✓ And both values are displayed

  10 scenarios (10 passed)
  85 steps (85 passed)
```

## 📊 Performance Tips

1. **Run Specific Tests:** Use `--tags` to run targeted scenarios
   ```bash
   npm run test:tag -- "@AC-01 or @AC-02"
   ```

2. **Headless Mode:** Set `headless: true` in hooks.ts for faster execution

3. **Parallel Execution:** Increase `parallel` in cucumber.js (limited by resources)

4. **Reduce Waits:** Adjust `waitForTimeout` values if app is fast

## 🔐 Security & Best Practices

- ✓ No hardcoded credentials in code
- ✓ Sensitive data not logged
- ✓ Page Object Model prevents brittle tests
- ✓ Clear error messages for debugging
- ✓ Proper resource cleanup in After hooks

## 📦 Technologies

- **Playwright** v1.40.1 - Modern, fast browser automation
- **Cucumber** v9.5.1 - BDD test framework
- **TypeScript** v5.3.3 - Type-safe scripting language
- **Node.js** v16+ - JavaScript runtime

## 📋 File Manifest

| File | Purpose | Size |
|------|---------|------|
| `cucumber.js` | Cucumber test runner configuration | 286 bytes |
| `tsconfig.json` | TypeScript compiler configuration | 500 bytes |
| `package.json` | NPM dependencies and scripts | 722 bytes |
| `src/pages/InterestCalculatorPage.ts` | Page Object Model class | 4003 bytes |
| `src/hooks/hooks.ts` | Cucumber hooks (setup/teardown) | 656 bytes |
| `src/steps/interestCalculator.steps.ts` | Step definitions | 6810 bytes |
| `features/interestCalculator.feature` | Gherkin test scenarios | 3143 bytes |
| `.gitignore` | Git exclusion rules | 122 bytes |

**Total:** ~16KB of well-organized, production-ready code

## 💡 Pro Tips

1. **Debug Single Step:**
   ```bash
   npm run test:debug
   ```

2. **View Test Report:**
   ```bash
   npm run playwright:report
   # or Cucumber HTML:
   open reports/cucumber-report.html
   ```

3. **Inspect Elements:**
   Add to any step: `await page.pause();` to open Playwright Inspector

4. **Check Selectors:**
   Use browser DevTools to verify element IDs and selectors

5. **Test Filtering:**
   ```bash
   npm run test:tag -- "not @AC-10"  # Run all except AC-10
   npm run test:tag -- "@AC-01 or @AC-02"  # Run AC-01 and AC-02
   ```

## 🎓 Learning Resources

- [Playwright Documentation](https://playwright.dev)
- [Cucumber Documentation](https://cucumber.io)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📞 Support

For issues or questions:

1. **Verify Installation:**
   ```bash
   npm list
   npx playwright --version
   ```

2. **Check Application:**
   - Visit `http://localhost:63342/InterestCalculator/src/interestCalculator.html`
   - Verify calculator is functional

3. **Review Logs:**
   - Check error messages in terminal
   - Look at generated reports in `reports/` directory

4. **Debug Tests:**
   - Run with `npm run test:debug`
   - Add console.log statements
   - Use Playwright Inspector

## 📝 Change Log

- **v1.0.0** (2026-07-22) - Initial release with 10 acceptance criteria tests

## License

Provided as-is for automation testing purposes.

---

**Happy Testing! 🎉**

For more information, refer to the framework documentation or individual file headers.
