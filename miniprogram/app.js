//app.js
const cloudFun = require("./promise/wxCloudFun.js")
const userInfoDB = require("./utils/userInfoDB.js")
const API = require("./promise/wxAPI.js")
App({
	globalData: {
		systemInfo: null,
		tabBarHeight: 49,
		cloudUserInfo: null,
		localUserInfo: null,
		openid: null,
		hasUserInfo: false,
	},

	onLaunch: function () {
		var that = this
		// 初始化云开发环境
		if (!wx.cloud) {
			console.error('请使用 2.2.3 或以上的基础库以使用云能力')
		} else {
			wx.cloud.init({
				env: 'lyy-production',
				traceUser: true
			})
		}
		// 获取手机信息
		wx.getSystemInfo({
			success: function (res) {
				that.globalData.systemInfo = res
				wx.setStorageSync('systemInfo', res)
				// 设置tabBar高度
				if (that.globalData.systemInfo.model == "iPhone X") {
					that.tabBarHeight = 83
				}
			}
		})

		// 获取用户信息
		this.getUserInfo()
	},

	/**
	 * 获取用户信息,包括从云端获取信息
	 */
	getUserInfo: function () {
		var that = this
		let userInfo =''
		// 判断用户是否授权
		API.GetSetting().then(res => {
			// 获取用户信息
			return API.GetUserInfo()
		}).then(res => {
			// that.globalData.userInfo = res.userInfo
			userInfo = res.userInfo
			that.globalData.hasUserInfo = true
			// 获取用户openid
			return cloudFun.CallWxCloudFun("login", {})
		}).then(res => {
			that.globalData.openid = res.openid
			return userInfoDB.DownLoadUserInfo(res.openid, userInfo)
		}).then(res => {
			// 回调广播函数
			if (that.userInfoReadyCallback) {
				that.userInfoReadyCallback()
			}
		})
	}
})