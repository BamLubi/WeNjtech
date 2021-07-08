const Promise = require('../promise/es6-promise.min.js')
const cloudDB = require("../promise/wxCloudDB.js")
const cloudFun = require("../promise/wxCloudFun.js")
const app = getApp() // 设置了不管用...？


/**
 * 下载流程:
 * 0. 准备 -> 拿到openid之后
 * 1. 下载云端数据 -没有-> 利用公共数据制作本地和云端数据
 *                -存在-> 覆盖本地数据
 * 
 * 更新流程:
 *    本地数据与云端数据比较 -> 找出需要更新的信息 -> 更新云端和本地数据
 */

// 用户信息模板
const userInfoTemplate = {
	nickName: '',
	avatarUrl: '',
	stuNum: '',
	setStuNumDate: new Date("2020-01-01 00:00:00")
}

// 云数据库集合名称
const collectionName = "weNjtech-userInfo"

/**
 * 云数据库下载用户个人信息
 * @param {string} openid 用户openid
 * @return {Promise}
 */
function DownloadUserInfo(openid) {
	return cloudDB.GetWxCloudDB(collectionName, {
		_openid: openid
	}).then(res => {
		console.log("[userInfoDB] [用户信息]: 云端有信息")
		// 比对云端数据，更新字段
		return AddNewKeyUserInfo(res.data[0])
	}, res => {
		console.log("[userInfoDB] [用户信息]: 云端无信息")
		return null
	})
}

function UploadUserInfo(userInfo) {
	// 判断云端是否有数据
	// 获取用户openid
	return cloudFun.CallWxCloudFun("login", {})
		.then(res => DownloadUserInfo(res.openid))
		.then(res => {
			// 确保云端没有数据
			if (res == null) {
				// 利用wx接口获取的公共信息,制作本地localUserInfo和cloudUserInfo
				userInfo = MakeUserInfo(userInfo)
				// 用户信息上传云端
				console.log("[userInfoDB] [用户信息]: 上传用户信息: ", userInfo)
				return cloudDB.AddWxCloudDB(collectionName, userInfo).then(res => userInfo)
			}
		})
}

/**
 * 制作cloudUerInfo和localUserInfo
 * @param {object} userInfo 用户信息
 * @return {object} 完善后的用户信息
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
		// getApp().globalData.localUserInfo = JSON.parse(JSON.stringify(tmpUserInfo))
		// getApp().globalData.cloudUserInfo = JSON.parse(JSON.stringify(tmpUserInfo))
		return tmpUserInfo
	} catch (error) {
		console.error(error)
	}
}

/**
 * 根据模板,比对云端没有的字段,并更新
 * @param {objetc} cloudUserInfo 云端的信息
 * @return {Promise}
 */
function AddNewKeyUserInfo(cloudUserInfo) {
	let updateItem = {}
	// 遍历模板，对不为空和未定义的键值对赋值
	for (let item in userInfoTemplate) {
		if (cloudUserInfo[item] == undefined) {
			updateItem[item] = userInfoTemplate[item]
			cloudUserInfo[item] = ''
		}
	}
	// 如果updateItem长度不为0，则更新
	if (Object.keys(updateItem).length == 0) {
		console.log("[app] [用户信息]: 无新增字段")
		return cloudUserInfo
	} else {
		console.log("[app] [用户信息]: 上传字段")
		return cloudDB.UpdateWxCloudDB(collectionName, cloudUserInfo._id, updateItem, '上传字段').then(res => cloudUserInfo)
	}
}

module.exports = {
	DownloadUserInfo,
	UploadUserInfo
}