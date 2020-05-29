// 云函数入口文件
const cloud = require('wx-server-sdk')
// 引入request-promise
var rp = require('request-promise')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let url = 'https://dev.bamlubi.cn/weNjtech/getEmptyClassroom/index.php'
  // let url = 'https://dev.bamlubi.cn/weNjtech/test.py'
  return await rp(url).then(res => {
    console.log("成功")
  }).catch(err => {
    console.error("失败")
  })
}