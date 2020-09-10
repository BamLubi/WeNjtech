//app.js
const cloudFun = require("./promise/wxCloudFun.js")
const userInfoDB = require("./utils/userInfoDB.js")
const API = require("./promise/wxAPI.js")
App({
	globalData: {
		systemInfo: null,
		tabBarHeight: 49,
		cloudUserInfo: null, // 云端用户信息
		localUserInfo: null, // 本地用户信息
		openid: null, // 用户openid
		hasUserInfo: false, // 判定是否获取到用户信息
		system: null, // 记录用户手机系统
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
				// 异步存入缓存
				wx.setStorageSync('systemInfo', res)
				// 设置系统
				that.globalData.system = res.system.split(" ")[0].toUpperCase()
				// 设置tabBar高度
				if (that.globalData.systemInfo.model == "iPhone X") {
					that.globalData.tabBarHeight = 83
				}
			}
		})

		// 获取用户信息
		that.getUserInfo()
	},

	/**
	 * 获取用户信息,包括从云端获取信息
	 */
	getUserInfo: function () {
		var that = this
		let userInfo = ''
		// 判断用户是否授权
		API.GetSetting().then(res => {
			// 此时用户已经授权，显示登陆
			wx.showLoading({
				title: '登陆中',
			})
			// 获取用户信息
			return API.GetUserInfo()
		}).then(res => {
			userInfo = res.userInfo
			that.globalData.hasUserInfo = true
			// 获取用户openid
			return cloudFun.CallWxCloudFun("login", {})
		}).then(res => {
			that.globalData.openid = res.openid
			return userInfoDB.DownLoadUserInfo(res.openid, userInfo)
		}).then(res => {
			// 登陆成功
			wx.hideLoading()
			wx.showToast({
				title: '登陆成功',
				duration: 1000
			})
			// 回调广播函数
			if (that.userInfoReadyCallback) {
				that.userInfoReadyCallback()
			}
		}).catch(err => {
			// 登陆失败
			wx.hideLoading()
			return API.ShowToast('登陆失败!部分功能失效', 'none', 1000)
		})
	}
})