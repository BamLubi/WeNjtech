// miniprogram/schoolBusPakage/utils/schoolBusDB.js
// Package all Database function used for schoolBusPackage into Promise Object

const Promise = require('../../promise/es6-promise.min.js')
const db = wx.cloud.database()
const _ = db.command

/**
 * @param {Object} season 'winter'|'summer'
 * @param {Object} direction 'forward'|'reverse'
 * @param {Object} week 'workingDay'|'weekend'
 * @param {Object} line 'busLine_1'|'busLine_2'
 * @param {Object} time A double number with 2 decimal,take example,'14.25' equals '14:25'
 * @param {Object} length the bus list has got
 */
function DownLoadBusLine(season, direction, week, line, time, length) {
    //return Promise Object
    return new Promise(function(resolve, reject) {
        db.collection('allBusLine')
            .where({
                isValid: true,
                validDay: week,
                validSeason: season,
                direction: direction,
                line: _.in(line),
				startTime: _.gte(parseFloat(time))
            })
            .field({
                startTime: true,
                endTime: true,
                amount: true,
				direction: true,
                line: true,
                site: true
            })
			.skip(length)
            .limit(10)
            .get({
				success: res=>{
					console.log('[云数据库] [GET] [班车信息] success: ', res)
					resolve(res)
				},
				fail: err=>{
					console.error('[云数据库] [GET] [班车信息] fail: ', err)
					reject(err)
				}
			})
    });
}

module.exports = {
	DownLoadBusLine: DownLoadBusLine
}