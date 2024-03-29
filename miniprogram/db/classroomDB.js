// miniprogram/schoolBusPakage/utils/classroomDB.js

const Promise = require('../promise/es6-promise.min.js')
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 下载教室信息
 * @param {string[]} lh 楼号
 * @param {number[]} time 时间
 * @param {number[]} lc 楼层
 * @param {number} length 已经获取的数据长度
 * @param {number} limit 每次获取数据长度限制
 * @param {boolean} mode 模式，默认为false，考研为true
 * @return {Promise}
 */
function DownLoadClassroom(lh, time, lc, length, limit=10, mode) {
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
        .limit(limit)
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