"use strict";

const puppeteer = require('puppeteer-extra');
// StealthPlugin is to avoid bot detection
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require('fs')
// First arg must be rut, second arg must be internet password for Santander, thirg arg must be file address for json generated output
const USERNAME = process.argv[2];
const PASS =  process.argv[3];
const OUTFILE =  process.argv[4];


(async () => {
  // Start browser and page
  const browser = await puppeteer.launch({
    // Options to avoid scrapper blocks
    ignoreHTTPSErrors: true,
    userDataDir: 'tmp',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"'
      ]
  })
  console.log(await browser.version());
  const page = await browser.newPage();
  console.log("page created");
  const preloadFile = fs.readFileSync('./preload.js', 'utf8');
  await page.evaluateOnNewDocument(preloadFile);
  await page.setViewport({
    width: 750,
    height: 1334,
    deviceScaleFactor: 1,
  });

  // Visit site
  console.log("going to site");
  await page.goto('https://www.santandermovil.cl');
  await page.waitForSelector('[formcontrolname=rut]').then(() => console.log('got [formcontrolname=rut]'));

  // Make Login TODO: manage attempts
  await page.type('[formcontrolname=rut]', USERNAME);
  await page.type('[formcontrolname=pass]', PASS);
  await page.screenshot({path: 'snaps/login0_sant.png'});
  await page.click('button[type=submit]');
  
  // Open latest movements
  await page.waitForNavigation();
  await page.waitForSelector('.menu-footer').then(() => console.log('got .menu-footer'));
  await page.waitFor(500)
  await page.screenshot({path: 'snaps/login_sant.png'});
  await page.click('a i.icono-accounts');

  // Scrap movements data
  await page.waitForSelector('.container-traspaso .movimiento--monto').then(() => console.log('got .container-traspaso .movimiento--monto'));
  await page.waitFor(500)
  await page.screenshot({path: 'snaps/current1_sant.png'});
  console.log("scrapping movements");
  const movements = await page.$$eval('.container-traspaso', nodes => {
    return nodes.map(node => {
      const date = node.querySelector('.fecha').textContent;
      const otherAccount = node.querySelector('.movimiento--nombre').textContent;
      const amount = node.querySelector('.movimiento--monto').textContent;
      //const balance = node.querySelector('p.movimiento--saldo').textContent.trim();
      return {date, otherAccount, amount};
    })
  });

  // console.log(movements);  //Uncomment for console view appart from output file
  // Write json file in given output address
  fs.writeFile(
    OUTFILE,
    JSON.stringify(movements, null, 2), 
    function(err, result) {
      if(err) console.log('error', err);
    }
  );

  // Close browser and exit
  await browser.close();
})();