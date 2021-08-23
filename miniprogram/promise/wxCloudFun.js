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

/**
 * 内容安全检测
 * @param {string} openid 
 * @param {string} content 
 * @return {Promise}
 */
function msgSecCheck(openid, content) {
    //return Promise Object
    return new Promise(function(resolve1, resolve2, reject) {
        let data = {
			openid: openid,
			content: content
		}
        CallWxCloudFun("msgSecCheck", data).then(res=>{
            if(res.result.suggest == "pass"){
                console.log("内容安全检测通过");
                // 言论没有问题
                resolve1(res)
            }else{
                console.log("内容安全检测未通过");
                // 有风险
                resolve2(res)
            }
        }).catch(err=>{
            console.log("错误");
            reject(err)
        })
    });
}

module.exports = {
    CallWxCloudFun: CallWxCloudFun,
    msgSecCheck: msgSecCheck
}