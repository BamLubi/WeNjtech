// miniprogram/db/zutuan_db.js
// 对应云数据库中 zutuan 集合
const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const API = require("../promise/wxAPI.js")
const {
    date2YMD
} = require('../utils/dateControl.js')
const db = wx.cloud.database()
const _ = db.command

const CollectionName = "weNjtech-kebiao";

/**
 * 获取课表信息
 * @param {*} openid
 */
function getKebiaoList(openid) {
    return new Promise(function (resolve, resolve2, reject) {
        db.collection(CollectionName)
            .where({
                _openid: openid
            })
            .orderBy('update_time', 'desc')
            .get({
                success: res => {
                    if (res.data.length != 0) {
						console.log(`[云数据库] [GET] [课表] success: `, res.data);
						resolve(res);
					} else if (res.data.length == 0) {
						console.log(`[云数据库] [GET] [课表] success: NULL`);
						resolve2(res);
					}
                },
                fail: err => {
                    console.error('[云数据库] [GET] [课表] fail: ', err)
                    reject(err)
                }
            })
    });
}

/**
 * 调用服务器接口爬取数据
 * @param {*} openid 
 */
function crawlKebiao(openid) {
    return new Promise(function (resolve, reject) {
        // 1. 获取用户学号和密码
        let app = getApp()
        let username = app.globalData.localUserInfo.stuNum
        let password = app.globalData.localUserInfo.stuPwd
        // 2. 构造请求信息
        let post_data = {
            username: username,
            password: password,
            openid: openid
        }
        let header = {
            'content-type': 'application/x-www-form-urlencoded'
        }
        API.Request('https://dev.bamlubi.cn/weNjtech/get_kebiao.php', post_data, 'POST', header, '调用服务器获取课表').then(res => {
            if (res.code == 200) {
                resolve(res.data)
            } else {
                throw new Error("服务器获取课表失败")
            }
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    getKebiaoList,
    crawlKebiao
}