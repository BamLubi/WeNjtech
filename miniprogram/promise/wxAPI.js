// miniprogram/promise/wxAPI.js
// Package all wechat API into Promise Object

const Promise = require('es6-promise.min.js')
const fs = wx.getFileSystemManager()

/**
 * call wx.showModal
 * @param {string} title modal's title
 * @param {string} content modal's content
 * @param {boolean} showCancel 
 * @param {string} cancelText 
 * @param {string} confirmText 
 */
function ShowModal(title, content, showCancel, cancelText, confirmText) {
    //return Promise Object
    return new Promise(function (confirm, cancel, reject) {
        wx.showModal({
            title: title,
            content: content,
            showCancel: showCancel,
            cancelText: cancelText,
            confirmText: confirmText,
            success: res => {
                if (res.confirm) {
                    console.log('[wxAPI] [模态框] [确认]')
                    confirm(res)
                } else if (res.cancel) {
                    console.log('[wxAPI] [模态框] [取消]')
                    cancel(res)
                }
            },
            fail: err => {
                console.error('[wxAPI] [模态框] [错误]')
                reject(err)
            }
        })
    });
}

/**
 * 
 * @param {*} title 
 * @param {*} icon 
 */
function ShowToast(title, icon, duration) {
    //return Promise Object
    return new Promise(function (resolve, reject) {
        wx.showToast({
            title: title,
            icon: icon,
            duration: duration,
            success: (res) => {
                resolve(res)
            },
        })
    });
}

function HideToast(title, icon) {
    //return Promise Object
    return new Promise(function (resolve, reject) {
        wx.hideToast({
            success: (res) => {
                resolve(res)
            },
        })
    });
}

/**
 * call wx.chooseAddress
 * 
 * @return Promise Object
 */
function ChooseAddress() {
    //return Promise Object
    return new Promise(function (resolve, reject) {
        wx.chooseAddress({
            success: res => {
                console.log("[wxAPI] [获取地址] success: ", res)
                resolve(res)
            },
            fail: err => {
                console.error("[wxAPI] [获取地址] fail: ", err)
                reject(err)
            }
        })
    });
}

/**
 * call wx.getSetting
 * 
 * @return Promise Object
 */
function GetSetting() {
    //return Promise Object
    return new Promise(function (resolve, resolve2, reject) {
        wx.getSetting({
            success: res => {
                // 已经授权
                if (res.authSetting['scope.userInfo']) {
                    console.log("[wxAPI] [获取用户设置] success: 已经授权")
                    resolve(res)
                } else {
                    console.log("[wxAPI] [获取用户设置] success: 未授权")
                    resolve2(res)
                }
            },
            fail: err => {
                console.error("[wxAPI] [获取用户设置] fail: ", err)
                reject(err)
            }
        })
    });
}

/**
 * call wx.getUserInfo
 * 
 * @return Promise Object
 */
function GetUserInfo() {
    //return Promise Object
    return new Promise(function (resolve, reject) {
        wx.getUserInfo({
            success: res => {
                console.log("[wxAPI] [获取用户信息] success: ", res.userInfo)
                // console.log({
                //     encryptedData: res.encryptedData,
                //     iv: res.iv
                // })
                resolve(res)
            },
            fail: err => {
                console.error("[wxAPI] [获取用户信息] fail: ", err)
                reject(err)
            }
        })
    });
}

/**
 * call wx.getFileSystemManager().saveFile()
 * 
 * @tempFilePath Temp File Path(when download file online,etc..)
 * @fileName File's name
 * @return Promise Object
 */
function SaveFile(tempFilePath, fileName) {
    //return Promise Object
    return new Promise(function (resolve, reject) {
        fs.saveFile({
            tempFilePath: tempFilePath,
            filePath: wx.env.USER_DATA_PATH + '/' + fileName,
            success: res => {
                console.log("[wxAPI] [保存文件] success: ", res)
                resolve(res)
            },
            fail: err => {
                console.error("[wxAPI] [保存文件] fail: ", err)
                reject(err)
            }
        })
    });
}

/**
 * call wx.openDocumnet()
 * 
 * @savedFilePath File Path
 * @return Promise Object
 */
function OpenDocument(savedFilePath) {
    //return Promise Object
    return new Promise(function (resolve, reject) {
        wx.openDocument({
            filePath: savedFilePath,
            success: res => {
                console.log("[wxAPI] [打开文件] success: ", res)
                resolve(res)
            },
            fail: err => {
                console.error("[wxAPI] [打开文件] fail: ", err)
                reject(err)
            }
        })
    });
}

/**
 * call wx.requestSubscribeMessage()
 * @param {str} tmplId 
 */
function RequestSubscribeMessage(tmplId) {
    //return Promise Object
    return new Promise(function (accept, failure, reject) {
        console.log("跳转了")
        wx.requestSubscribeMessage({
            tmplIds: [tmplId],
            success: res => {
                console.log("成功调起", res[tmplId])
                if (res[tmplId] == 'accept') {
                    console.log("[wxAPI] [授权订阅消息] accept")
                    accept()
                } else {
                    console.log("[wxAPI] [授权订阅消息] fail")
                }
            },
            fail: err => {}
        })
    });
}

function _hideKeyBoard() {
    return new Promise(function (resolve, reject) {
        wx.hideKeyboard({
          complete: (res) => {
              console.log("[wxAPI] [收起键盘] success")
              resolve()
          },
          fail: err => {}
        })
    })
}


module.exports = {
    ShowModal: ShowModal,
    ChooseAddress: ChooseAddress,
    GetSetting: GetSetting,
    GetUserInfo: GetUserInfo,
    SaveFile: SaveFile,
    OpenDocument: OpenDocument,
    RequestSubscribeMessage: RequestSubscribeMessage,
    ShowToast: ShowToast,
    HideToast: HideToast,
    _hideKeyBoard
}