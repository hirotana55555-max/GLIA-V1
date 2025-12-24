const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Starting Browser Launch Verification...');
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Often needed in containers
    });
    console.log('Browser launched successfully!');
    
    const page = await browser.newPage();
    const targetPath = path.resolve(__dirname, '../apps/electron-app/index.html');
    console.log(`Navigating to: file://${targetPath}`);
    
    await page.goto(`file://${targetPath}`);
    const content = await page.content();
    const title = await page.title();
    
    console.log('--- UI SNAPSHOT START ---');
    console.log(`Title: ${title}`);
    console.log(`Body Length: ${content.length}`);
    // Extract some key elements for the spec
    const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
    console.log(`Visible Text: ${bodyText.substring(0, 200)}...`);
    console.log('--- UI SNAPSHOT END ---');

    await browser.close();
    console.log('Browser closed cleanly.');
  } catch (error) {
    console.error('Browser Verification Failed:', error);
    process.exit(1);
  }
})();
