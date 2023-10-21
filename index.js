const mqtt = require('mqtt')
const Browser = require('./browser')
const publishData = require('./publishData')

// 读取参数
const config = new Map()
const args = process.argv.splice(2)
for (let val of args) {
  if (val.indexOf('=') > 0) {
    const arr = val.split('=')
    const key = arr[0].trim()
    const value = arr[1].trim()
    config.set(key, value)
  }
}

console.log(config);
(async () => {
  const headless = config.get('headless')
  const user = config.get('user')
  const host = config.get('host')

  const topicCode = 'sgcc/code'
  const browser = new Browser()
  await browser.launch(headless)

  // browser.getCode(user)
  // return

  const client = mqtt.connect(`mqtt://${host}`);
  client.on("connect", async () => {
    console.log('订阅验证码接收主题')
    client.subscribe(topicCode)

    browser.getCode(user)
  })

  client.on("message", async (topic, payload) => {
    const message = payload.toString()
    // 等待验证码回传
    if (topic == topicCode && message.includes('【网上国网】')) {
      // 提取验证码
      const result = /\d{6}/.exec(message)
      console.log(result)
      const code = result[0]

      await browser.login(code)

      const list = await browser.getList()
      console.log(list)

      if (Array.isArray(list) && list.length > 0) {
        // 发送到HomeAssistant
        await publishData(client, list)
        await browser.sleep(3)
        await browser.close();
      }
    }
  })

  // 10分钟没有处理完成，强制退出
  setTimeout(() => {
    process.exit(1)
  }, 10 * 60 * 1000)

})();