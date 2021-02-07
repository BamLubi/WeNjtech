// miniprogram/promise/wxCloudFun.js
// Package all wx cloud function into Promise Object

const Promise = require('es6-promise.min.js')

/**
 * used to call weixin Cloud Function
 * call wx.cloud.callFunction
 * @param {string} funName cloud function's name
 * @param {object[]} data cloud function's data for POST
 * @return {Promise}
 */
function CallWxCloudFun(funName, data) {
    //return Promise Object
    return new Promise(function(resolve, reject) {
        wx.cloud.callFunction({
            name: funName,
            data: data,
            success: res => {
                console.log('[云函数] [' + funName + '] success: ', res.result)
                resolve(res.result)
            },
            fail: err => {
				console.error('[云函数] [' + funName + '] fail: ', err)
                reject(err)
            }
        })
    });
}

module.exports = {
    CallWxCloudFun: CallWxCloudFun
}