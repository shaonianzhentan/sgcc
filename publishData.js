const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

module.exports = (client, list) => {
  return new Promise(async (resolve) => {

    const identifiers = "https://github.com/shaonianzhentan/sgcc"

    const publish = (topic, payload) => {
      client.publish(topic, JSON.stringify(payload), {
        retain: true
      })
    }

    const sendData = async (index) => {
      const nextIndex = index + 1
      const item = list[index]
      const arr = item.user.split(':')
      const unique_id = arr[1]

      const name = arr[0]
      const state_topic = `sgcc/${unique_id}`
      const json_attr_t = `sgcc/${unique_id}/attr`

      console.log('发送配置')

      publish(`homeassistant/sensor/${unique_id}/config`, {
        "icon": "mdi:flash-red-eye",
        unique_id,
        name,
        state_topic,
        json_attr_t,
        unit_of_measurement: '元',
        "device": {
          "name": "网上国网",
          "configuration_url": identifiers,
          "identifiers": [identifiers],
          "model": '95598',
          "sw_version": '1.0',
          "manufacturer": "shaonianzhentan"
        }
      })

      await sleep(3)
      console.log('发送状态')

      publish(state_topic, parseFloat(item.ye.replace('元', '')))

      // 发送属性
      publish(json_attr_t, {
        姓名: name,
        户号: unique_id,
        预存电费: item.yc,
        更新时间: item.date.replace('截止到', '')
      })

      if (nextIndex < list.length) {
        await sleep(3)
        await sendData(nextIndex)
      }
    }

    await sendData(0)

    await sleep(3)
    console.log('MQTT停止服务')
    client.end();

    resolve()
  });


}