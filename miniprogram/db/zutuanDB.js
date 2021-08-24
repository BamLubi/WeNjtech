// miniprogram/db/zutuan_db.js
// 对应云数据库中 zutuan 集合
const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const Util = require("../utils/util.js")
const {
    date2YMD
} = require("../utils/dateControl.js")
const db = wx.cloud.database()
const _ = db.command

const CollectionName = "weNjtech-zutuan";

/**
 * 获取组团列表
 * @param {*} type 类型
 * @param {*} skip 跳过数量
 * @param {*} limit 限制
 */
function getZutuanList(type, sort, skip = 0, limit = 10) {
    return new Promise(function (resolve, reject) {
        db.collection(CollectionName)
            .where({
                type: _.in(type),
                deadTime: _.gt(new Date())
            })
            .skip(skip)
            .limit(limit)
            .orderBy(sort, 'desc')
            .get({
                success: res => {
                    res.data.filter(function (x) {
                        x.isAvailable = x.deadTime < new Date() ? false : true
                        x.deadTime = date2YMD(x.deadTime)
                        x.updateTime = date2YMD(x.updateTime)
                    })
                    console.log('[云数据库] [GET] [组团信息] success: ', res.data)
                    resolve(res.data)
                },
                fail: err => {
                    console.error('[云数据库] [GET] [组团信息] fail: ', err)
                    reject(err)
                }
            })
    });
}

/**
 * 获取我的组团列表
 * @param {*} type 类型
 * @param {*} skip 跳过数量
 * @param {*} limit 限制
 */
function getMyZutuanList(openid, skip = 0, limit = 10) {
    return new Promise(function (resolve, reject) {
        db.collection(CollectionName)
            .where({
                _openid: openid
            })
            .skip(skip)
            .limit(limit)
            .orderBy('deadTime', 'desc')
            .get({
                success: res => {
                    res.data.filter(function (x) {
                        x.isAvailable = x.deadTime < new Date() ? false : true
                        x.deadTime = date2YMD(x.deadTime)
                        x.updateTime = date2YMD(x.updateTime)
                    })
                    console.log('[云数据库] [GET] [组团信息] success: ', res.data)
                    resolve(res.data)
                },
                fail: err => {
                    console.error('[云数据库] [GET] [组团信息] fail: ', err)
                    reject(err)
                }
            })
    });
}

function addZutuan(_id, userInfo, type, num, tel, detail, date) {
    // 制作组团信息
    let data = new MakeZutuan(userInfo, type, num, tel, detail, new Date(date + " 23:59:59"))
    console.log("测试：", data);
    if (_id == null || _id == '') {
        // 新增上传
        return CloudDB.AddWxCloudDB(CollectionName, data)
    } else {
        // 修改
        return CloudDB.UpdateWxCloudDB(CollectionName, _id, data, '更新组团信息')
    }
}

function MakeZutuan(userInfo, type, num, tel, detail, date) {
    this.nickName = userInfo.nickName
    this.avatarUrl = userInfo.avatarUrl
    this.type = type
    this.num = num
    this.tel = tel
    this.detail = detail
    this.deadTime = date
    this.updateTime = new Date()
}

module.exports = {
    getZutuanList,
    getMyZutuanList,
    addZutuan
}