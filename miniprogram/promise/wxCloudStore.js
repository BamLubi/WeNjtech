// miniprogram/promise/wxCloudStore.js
// Package all wx cloud function into Promise Object

const Promise = require('es6-promise.min.js')

/**
 * used to download file which stored in cloud store
 * call wx.cloud.downloadFile
 * @param {string} fileID file id
 * @return {Promise}
 */
function DownloadWxCloudStore(fileID) {
    //return Promise Object
    return new Promise(function (resolve, reject) {
        wx.cloud.downloadFile({
            fileID: fileID,
            success: res => {
                console.log("[云存储] [下载] success: ", res)
                resolve(res)
            },
            fail: err => {
                console.error("[云存储] [下载] fail: ", err)
                reject(err)
            }
        })
    })
}

module.exports = {
    DownloadWxCloudStore: DownloadWxCloudStore
}