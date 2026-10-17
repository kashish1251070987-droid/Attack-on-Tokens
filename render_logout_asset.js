const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(pathToFileURL(path.join(__dirname, 'assets', 'logout-cartoon.svg')).href);
  await page.screenshot({ path: path.join(__dirname, 'assets', 'logout-cartoon.png') });
  await browser.close();
})();
