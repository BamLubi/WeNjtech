//app.js
const cloudFun = require("./promise/wxCloudFun.js")
const userInfoDB = require("./utils/userInfoDB.js")
const API = require("./promise/wxAPI.js")
App({
	globalData: {
		systemInfo: null, // 系统信息
		tabBarHeight: 49, // 底部tabBar高度
		cloudUserInfo: null, // 云端用户信息
		localUserInfo: null, // 本地用户信息
		openid: null, // 用户openid
		hasUserInfo: null, // true代表有数据,false代表没数据,null代表还在请求
		systemInfo: null, // 记录用户手机系统
	},

	onLaunch: function () {
		let that = this

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
				// TODO: 设置tabBar高度，用于班车页面的下滑监听，需要改善
				if (that.globalData.systemInfo.model == "iPhone X") {
					that.globalData.tabBarHeight = 83
				}
			}
		})

		// 准备用户信息
		that.getUserInfo()
	},

	/**
	 * 准备用户信息,包括openid及用户身份信息
	 * 用户身份信息由云端获取,并对应着hasUserInfo
	 */
	getUserInfo: function () {
		/**
		 * 获取授权已经没用了
		 * 是否有用户的信息必须从数据库查,如果没有,就按需访问
		 */
		let that = this
		// 获取用户openid
		cloudFun.CallWxCloudFun("login", {}).then(res => {
			that.globalData.openid = res.openid
			// 下载用户个人信息
			return userInfoDB.DownloadUserInfo(res.openid)
		}).then(res => {
			// 如果返回信息不为null
			if (res != null) {
				that.globalData.cloudUserInfo = res
				that.globalData.localUserInfo = res
				that.globalData.hasUserInfo = true
				// 回调广播函数
				if (that.userInfoReadyCallback) {
					that.userInfoReadyCallback()
				}
			}else{
				// 云端无信息
				that.globalData.hasUserInfo = false
			}
		}).catch(err => {
			// 登陆失败
			console.log("获取用户个人信息失败");
		})
	}
})