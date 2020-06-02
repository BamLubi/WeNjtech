// miniprogram/schoolBusPakage/utils/classroomDB.js

const Promise = require('../promise/es6-promise.min.js')
const db = wx.cloud.database()
const _ = db.command

function DownLoadClassroom(lh, time, lc, length) {
  return new Promise(function (resolve, reject) {
    db.collection('weNjtech-classroom')
      .where({
        lh: _.in(lh),
        emptyTime: _.in(time),
        lc: _.in(lc)
      })
      .orderBy('name', 'asc')
      .skip(length)
      .limit(10)
      .get({
        success: res => {
          console.log('[云数据库] [GET] [空教室信息] success: ', res)
          resolve(res)
        },
        fail: err => {
          console.error('[云数据库] [GET] [空教室信息] fail: ', err)
          reject(err)
        }
      })
  });
}

module.exports = {
  DownLoadClassroom: DownLoadClassroom
}