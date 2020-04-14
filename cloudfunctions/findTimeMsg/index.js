// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lyy-production'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const execTasks = [];
  // 1. 查询是否有定时任务
  let taskRes = await db.collection('LiteNjtech-messageTask').get()
  let tasks = taskRes.data;
  // 2. 定时任务是否到达触发时间
  let now = new Date(Date.now() + (8 * 60 * 60 * 1000));
  try {
    for (let i = 0; i < tasks.length; i++) {
      let execTime = new Date(tasks[i].execTime.getTime() + (8 * 60 * 60 * 1000))
      console.log("当前时间", now)
      console.log("执行时间", execTime)
      if (execTime <= now) {
        execTasks.push(tasks[i]);
        console.log("执行下发")
        // 定时任务数据库中删除该任务
        await db.collection('LiteNjtech-messageTask').doc(tasks[i]._id).remove()
      }
    }
  } catch (e) {
    console.error(e)
  }
  // 3. 处理待执行任务
  for (let i = 0; i < execTasks.length; i++) {
    let task = execTasks[i];
    if (task.taskType == "行程提醒") {
      task.data.openid = task._openid
      try {
        let res = await cloud.callFunction({
          name: 'sendBusMsg',
          data: task.data
        })
      } catch (e) {
        console.error(e)
      }
    }
  }
}