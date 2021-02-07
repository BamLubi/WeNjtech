// miniprogram/schoolBusPakage/utils/schoolBusDB.js
// Package all Database function used for schoolBusPackage into Promise Object

const Promise = require('../promise/es6-promise.min.js')
const db = wx.cloud.database()
const _ = db.command

/**
 * 下载汽车时间安排
 * @param {string} season 'winter'|'summer'
 * @param {string} direction 'forward'|'reverse'
 * @param {string} week 'workingDay'|'weekend'
 * @param {string} line 'busLine_1'|'busLine_2'
 * @param {number} time A double number with 2 decimal,take example,'14.25' equals '14:25'
 * @param {number} length the bus list has got
 * @return {Promise}
 */
function DownLoadBusLine(season, direction, week, line, time, length) {
    return new Promise(function (resolve, reject) {
        db.collection('weNjtech-allBusLine')
            .where({
                isValid: true,
                validDay: week,
                validSeason: season,
                direction: direction,
                line: _.in(line),
                endTime: _.gte(parseFloat(time))
            })
            .field({
                startTime: true,
                endTime: true,
                amount: true,
                direction: true,
                line: true,
                site: true
            })
            .orderBy('startTime', 'asc')
            .skip(length)
            .limit(5)
            .get({
                success: res => {
                    // 格式化res中时间信息后，在传递给前端
                    console.log('[云数据库] [GET] [班车信息] [old] success: ', res)
                    for (let i = 0; i < res.data.length; i++) {
                        res.data[i].startTime = FormatBusTime(parseFloat(res.data[i].startTime))
                        res.data[i].endTime = FormatBusTime(parseFloat(res.data[i].endTime))
                    }
                    console.log('[云数据库] [GET] [班车信息] success: ', res)
                    resolve(res)
                },
                fail: err => {
                    console.error('[云数据库] [GET] [班车信息] fail: ', err)
                    reject(err)
                }
            })
    });
}

/**
 * 格式化时间信息
 * @param {number} int_time A double number with 2 decimal,take example,'14.25' equals '14:25'
 * @return {string} 时间 "xx:xx"
 */
function FormatBusTime(int_time) {
    let time = {
        "hour": parseInt(int_time),
        "minute": parseInt(((int_time * 100) % 100).toFixed(0))
    }
    let str_time = time.hour < 10 ? "0" + time.hour : time.hour
    // console.log("格式化小时", int_time, time.hour, str_time)
    str_time += ":"
    str_time += time.minute == 0 ? "00" : time.minute < 10 ? "0" + time.minute : time.minute
    // console.log("格式化", int_time, str_time)
    return str_time
}

module.exports = {
    DownLoadBusLine: DownLoadBusLine
}