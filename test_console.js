import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log("HTML length:", bodyHTML.length);
  if (bodyHTML.length < 2000) {
      console.log(bodyHTML);
  }
  
  await browser.close();
})();
