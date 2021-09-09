// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:'lyy-production'
})

// 云函数入口函数
//分页
exports.main = async (event, context) => {
  return await cloud.database().collection('weNjtech-jwcNotice').field({
    _id: true,
    title: true,
    pubDate: true
  })
  .skip(event.len)
  .limit(event.num)
  .get()
}