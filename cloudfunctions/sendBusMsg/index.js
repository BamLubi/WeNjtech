// 云函数入口文件
// 思路：每分钟查询数据库，是否存在定时任务，存在则下发任务

const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: event.openid,
      page: 'pages/schoolBus/schoolBus',
      lang: 'zh_CN',
      data: {
        date3: {value: event.outTime},
        thing2: {value: event.site},
        date13: {value: event.outDate},
        thing5: { 
          value: "距离发车时间很近,请准备好校园卡乘车!"
        }
      },
      templateId: 'phgt8Qyy0LzcLLn5vq_JEj0qKJ-m7hf6vOLY6OESUXY',
      miniprogramState: 'developer'
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}