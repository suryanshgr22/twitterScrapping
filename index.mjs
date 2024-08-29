import puppeteer from 'puppeteer';
// import dotenv from 'dotenv';

// dotenv.config();

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://x.com/i/flow/login', { waitUntil: 'networkidle2' });

  await page.waitForSelector('input[name="text"]');
  await page.type('input[name="text"]', "your username");

  await page.keyboard.press('Enter');
  await new Promise(resolve => setTimeout(resolve, 2000));  // Replaced page.waitForTimeout

  await page.waitForSelector('input[name="password"]', { visible: true });
  await page.type('input[name="password"]', "password");

  await page.keyboard.press('Enter');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('Login successful');
  // await browser.close();
})();
