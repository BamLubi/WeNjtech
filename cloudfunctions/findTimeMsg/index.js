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
  let taskRes = await db.collection('weNjtech-messageTask').get()
  let tasks = taskRes.data;
  // 2. 定时任务是否到达触发时间
  let now = new Date(Date.now()).getTime();
  console.log("当前时间", now)
  try {
    for (let i = 0; i < tasks.length; i++) {
      let execTime = tasks[i].execTime
      if (execTime <= now) {
        console.log("执行时间", execTime)
        execTasks.push(tasks[i]);
        console.log("加入下发队列", tasks[i]._id, tasks[i].outTime)
        // 定时任务数据库中删除该任务
        await db.collection('weNjtech-messageTask').doc(tasks[i]._id).remove()
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
        console.log("下发成功", task._id, task.outTime)
      } catch (e) {
        // 以后可以补充回填到任务队列
        console.error(e)
      }
    }
  }
}