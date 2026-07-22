const fs = require('fs');
const path = require('path');

// Ensure output folders exist before Cucumber writes reports
['reports', 'playwright-report'].forEach((dir) => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

module.exports = {
  default: {
    require: ['src/steps/**/*.ts', 'src/hooks/**/*.ts', 'src/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json',
      'junit:reports/cucumber-report.xml',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    parallel: 1,
  },
};
