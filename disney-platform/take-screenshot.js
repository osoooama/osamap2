const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: 'C:\\Users\\osama\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe'
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ 
    path: 'screenshot.png', 
    fullPage: true 
  });
  
  console.log('Screenshot saved to screenshot.png');
  await browser.close();
})();
