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

  const topicPhone = 'sgcc/phone'
  const browser = new Browser()
  await browser.launch(headless)
  await browser.sleep(5)

  // browser.getCode(user)
  // return

  const client = mqtt.connect(`mqtt://${host}`);
  client.on("connect", async () => {
    console.log('订阅验证码接收主题')
    client.subscribe(topicPhone)

    browser.getCode(user)
  })

  client.on("message", async (topic, payload) => {
    // 等待验证码回传
    if (topic == topicPhone) {

      await browser.login(payload.toString())

      await sleep(10)

      const list = await browser.getList()
      console.log(list)

      if (Array.isArray(list) && list.length > 0) {
        // 发送到HomeAssistant
        await publishData(client, list)
        await sleep(3)
        await browser.close();
      }
    }
  })

})();