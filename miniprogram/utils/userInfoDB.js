const Promise = require('../promise/es6-promise.min.js')
const cloudDB = require("../promise/wxCloudDB.js")
const app = getApp() // 设置了不管用...？


/**
 * 下载流程:
 * 0. 准备 -> 拿到openid之后
 * 1. 下载云端数据 -没有-> 利用公共数据制作本地和云端数据
 *                -存在-> 覆盖本地数据
 * 
 * 更新流程:
 * 1. 本地数据与云端数据比较 -> 找出需要更新的信息 -> 更新云端和本地数据
 */

const userInfoTemplate = {
  nickName: '',
  avatarUrl: '',
  stuNum: '',
  setStuNumDate: new Date("2020-01-01 00:00:00")
}

const collectionName = "weNjtech-userInfo"

/**
 * 云数据库下载用户个人信息
 * @param {string} openid 用户openid
 * @param {object} userInfo wx.getUserInfo拿到的用户信息
 */
function DownLoadUserInfo(openid, userInfo) {
  return cloudDB.GetWxCloudDB(collectionName, {
    _openid: openid
  }).then(res => {
    console.log("[app] [用户信息]: 云端有信息")
    // 比对云端数据，更新字段
    return UpdateNewKeyUserInfo(res.data[0])
    // // 利用云端数据,制作cloudUserInfo和localUserInfo
    // MakeUserInfo(res.data[0])
    // return new Promise(function (resolve) {
    //   resolve()
    // })
  }, res => {
    console.log("[app] [用户信息]: 云端无信息")
    // 利用wx接口获取的公共信息,制作本地localUserInfo和cloudUserInfo
    userInfo = MakeUserInfo(userInfo)
    return cloudDB.AddWxCloudDB(collectionName, userInfo)
  })
}

/**
 * 制作cloudUerInfo和localUserInfo
 * @param {object} userInfo 提供的用户信息
 */
function MakeUserInfo(userInfo) {
  try {
    // 拷贝模板
    let tmpUserInfo = JSON.parse(JSON.stringify(userInfoTemplate))
    // 遍历模板，对不为空和未定义的键值对赋值
    for (let item in userInfoTemplate) {
      if (userInfo[item] != undefined && userInfo[item] != '') {
        tmpUserInfo[item] = userInfo[item]
      }
    }
    // 拷贝到全局
    getApp().globalData.localUserInfo = JSON.parse(JSON.stringify(tmpUserInfo))
    getApp().globalData.cloudUserInfo = JSON.parse(JSON.stringify(tmpUserInfo))
    return tmpUserInfo
  } catch (error) {
    console.error(error)
  }
}

/**
 * 根据模板,比对云端没有的字段,并更新
 * @param {objetc} cloudUserInfo 云端的信息
 */
function UpdateNewKeyUserInfo(cloudUserInfo){
  let updateItem = {}
  // 遍历模板，对不为空和未定义的键值对赋值
  for (let item in userInfoTemplate) {
    if (cloudUserInfo[item] == undefined) {
      updateItem[item] = userInfoTemplate[item]
    }
  }
  // 如果updateItem长度不为0，则更新
  if(Object.keys(updateItem).length == 0){
    console.log("[app] [用户信息]: 无新增字段")
    // 利用云端数据,制作cloudUserInfo和localUserInfo
    MakeUserInfo(cloudUserInfo)
    return new Promise(function (resolve) {
      resolve()
    })
  } else {
    console.log("[app] [用户信息]: 上传字段")
    return cloudDB.UpdateWxCloudDB(collectionName, cloudUserInfo._id, updateItem, '上传字段').then(res=>{
      return DownLoadUserInfo(cloudUserInfo._id, cloudUserInfo)
    })
  }
}

module.exports = {
  DownLoadUserInfo
}