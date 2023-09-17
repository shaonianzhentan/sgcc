const fs = require('fs')
const puppeteer = require('puppeteer')
const mqtt = require('mqtt')
const { default: DdddOcr } = require('ddddocr')
const publishData = require('./publishData')

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
const list = []
const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));
(async () => {

  const LOGIN_URL = "https://www.95598.cn/osgweb/login"

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: config.headless,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--start-maximized'],
  });
  const pages = await browser.pages();
  const page = pages[0]

  // Navigate the page to a URL
  await page.goto(LOGIN_URL);

  await sleep(5)
  console.log('切换登录面板')

  // 切换用户密码登录
  await page.click('.user');

  await sleep(5)
  console.log('输入用户名和密码')

  // 输入用户名和密码
  await page.type('.el-input__inner:first-child', config.user);
  await page.type('.el-input__inner[type="password"]', config.password);

  // 获取图片
  const imgHandle = await page.$('.code-mask img')
  let errCount = 0

  const ocrRecognition = async () => {
    const base64 = await page.evaluate(img => img.getAttribute('src').replace("data:image/jpg;base64,", ""), imgHandle);
    console.log('获取验证码')

    if (!base64) return

    // OCR识别
    const ddddocr = await DdddOcr.create()
    const code = await ddddocr.classification(Buffer.from(base64, "base64"));
    if (!code) return
    console.log('验证码', code)

    if (code.length != 4) {
      // 5次重试机制
      if (errCount > 5) return

      errCount += 1
      console.log('重新识别验证', code)
      imgHandle.click()
      sleep(3)
      return await ocrRecognition()
    }
    return code
  }

  let code = await ocrRecognition()
  if (!code) return console.log('验证码处理失败')

  // 输入验证码
  await page.type('.el-input__inner:last-child', code);

  await sleep(1)
  console.log('开始登录')

  // 登录
  await page.click('.el-button.el-button--primary');

  await sleep(5)
  console.log('读取户号')

  const selectUser = await page.waitForXPath("//div[@class='el-dropdown']/span")
  selectUser.click()

  await sleep(5)

  // 获取数据
  const getData = async (user) => {
    const result = { user }
    const priceHandle = await page.$$('.zhanghu-full .cff8')
    priceHandle.forEach(async (handle, index) => {
      const money = await handle.evaluate(ele => ele.textContent)
      // 账户余额为：75.07元，预存电费：90.14元
      console.log('金额', money)
      if (index == 0) {
        result.ye = money
      } else {
        result.yc = money
      }
    })

    const dateHandle = await page.$('.zhanghu-full .content p')
    const date = await dateHandle.evaluate(ele => ele.textContent)
    console.log('时间', date)
    result.date = date
    return result
  }

  const liHandle = await page.$$('.el-dropdown-menu.el-popper li')

  // 获取户号
  const getUserInfo = async (index) => {
    const nextIndex = index + 1

    const handle = liHandle[index]
    const user = await handle.evaluate(ele => ele.textContent.trim())
    console.log('户号', user)
    list.push(await getData(user))

    if (nextIndex < liHandle.length) {
      console.log('切换到下一个')
      liHandle[nextIndex].click()
      await sleep(5)
      await getUserInfo(nextIndex)
    }
  }

  await getUserInfo(0)

  console.log(list)

  // 发送到HomeAssistant
  await publishData(config.host, list)

  await sleep(3)

  await browser.close();
})();