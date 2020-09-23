// miniprogram/schoolBusPakage/utils/classroomDB.js

const Promise = require('../promise/es6-promise.min.js')
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 
 * @param {*} lh 
 * @param {*} time 
 * @param {*} lc 
 * @param {*} length 
 * @param {boolean} mode 模式，默认为false，考研为true
 */
function DownLoadClassroom(lh, time, lc, length, mode) {
  return new Promise(function (resolve, reject) {
    console.log('[云数据库] [GET] [空教室信息] 模式: ', mode)
    if (!mode) {
      // 默认模式
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
            resolve(res.data)
          },
          fail: err => {
            console.error('[云数据库] [GET] [空教室信息] fail: ', err)
            reject(err)
          }
        })
    } else if (mode) {
      // 考研模式
      db.collection('weNjtech-classroom')
        .aggregate()
        .project({
          _id: true,
          cdlb_id: true,
          lh: true,
          name: true,
          emptyTime: true,
          lc: true,
          count: $.size('$emptyTime')
        })
        .match({
          lh: _.in(lh),
          lc: _.in(lc)
        })
        .sort({
          count: -1
        })
        .skip(length)
        .limit(10)
        .end({
          success: res => {
            console.log('[云数据库] [GET] [空教室信息] success: ', res)
            resolve(res.list)
          },
          fail: err => {
            console.error('[云数据库] [GET] [空教室信息] fail: ', err)
            reject(err)
          }
        })
    }
  });
}

module.exports = {
  DownLoadClassroom: DownLoadClassroom
}