const puppeteer = require('puppeteer-core');

puppeteer.launch({
  headless: false,
  executablePath: '/usr/bin/chromium-browser'
}).then(async browser => {
  console.log(browser)
  console.log('获取选项卡')
  const pages = await browser.pages();
  const page = pages[0]
  console.log('登录页面跳转')
  await page.goto('https://baidu.com');
})