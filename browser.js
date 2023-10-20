const puppeteer = require('puppeteer-core')

const LOGIN_URL = "https://www.95598.cn/osgweb/login"
const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));


let page = null

module.exports = class {

  constructor() {
    this.sleep = sleep
  }

  // 打开登录页面
  async launch(headless) {

    const browser = await puppeteer.launch({
      headless: headless ? false : 'new',
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      // executablePath: '/usr/bin/chromium-browser',
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized', '--no-sandbox'],
    });
    this.browser = browser
    const pages = await browser.pages();
    page = pages[0]
    await page.goto(LOGIN_URL);
  }

  // 手机号登录
  async getCode(phone) {
    console.log('切换登录面板')

    // 切换账号登录
    await page.click('.user');

    await sleep(5)
    console.log('切换短信验证码登录')
    await page.click('.code_login')

    await sleep(5)

    console.log('输入手机号')
    await page.type('.code_form .el-input__inner:first-child', phone);

    await sleep(1)
    console.log('获取验证码')
    await page.click('.yanzheng')
  }

  // 登录
  async login(code) {
    console.log('输入验证码')
    await page.type('.code_form_yzm  .el-input__inner:first-child', code);

    await sleep(1)
    console.log('开始登录')

    await page.click('.el-button.el-button--primary');
  }

  // 读取信息
  async getList() {
    const list = []
    console.log('读取户号')

    const selectUser = await page.waitForXPath("//div[@class='el-dropdown']/span")

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
        await selectUser.click()
        await sleep(5)
        liHandle[nextIndex].click()
        await sleep(5)
        await getUserInfo(nextIndex)
      }
    }

    await getUserInfo(0)

    console.log(list)
    return list
  }

  // 关闭浏览器
  close() {
    browser.close();
  }
}
