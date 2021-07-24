// miniprogram/mePackage/pages/info/info.js
const app = getApp()
const cloudDB = require("../../../promise/wxCloudDB.js")
const API = require("../../../promise/wxAPI.js")
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: {
			avatarUrl: '',
			nickName: '',
			stuNum: '',
			stuPwd: ''
		},
		canEditStuNum: false,
		leftDay: null,
		canEditStuPwd: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// 判断是否可以修改学号
		let nowDate = new Date()
		let cloudDate = new Date(app.globalData.localUserInfo.setStuNumDate)
		let leftDay = (nowDate - cloudDate) / (24 * 60 * 60 * 1000)
		leftDay = 90 - parseInt(leftDay)
		if (leftDay <= 0) {
			this.setData({
				canEditStuNum: true
			})
		}
		this.setData({
			leftDay: leftDay,
			userInfo: app.globalData.localUserInfo
		})
		// 如果密码为空,则可以修改
		if (this.data.userInfo.stuPwd == ''){
			this.setData({
				canEditStuPwd: true
			})
		}
		// 关闭下拉动作
		wx.stopPullDownRefresh()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		this.onLoad()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},

	/**
	 * 学号输入框监听
	 */
	getStuNum: function (e) {
		this.setData({
			["userInfo.stuNum"]: e.detail.value
		})
	},

	submitStuNum: function () {
		console.log("提交学号");
		let that = this
		var collectionName = "weNjtech-userInfo"
		// 隐藏键盘
		API._hideKeyBoard()
		// 显示确认框
		API.ShowModal('', "请确保您使用了您自己的\n学号(" + that.data.userInfo.stuNum + ")\n每90天仅可修改一次!", true, '我再想想', '我确定了').then(res => {
			wx.showLoading({
				title: '提交中'
			})
			return cloudDB.GetWxCloudDB(collectionName, {
				_openid: app.globalData.openid
			})
		}).then(res => {
			let nowDate = new Date()
			return cloudDB.UpdateWxCloudDB(collectionName, res.data[0]._id, {
				stuNum: that.data.userInfo.stuNum,
				setStuNumDate: nowDate
			}, '更新学号')
		}).then(res => {
			wx.hideLoading()
			wx.showToast({
				title: '设置成功'
			})
			that.setData({
				canEditStuNum: false,
				leftDay: 90
			})
		})
	},

	editStuPwd: function () {
		this.setData({
			canEditStuPwd: true
		})
	},

	getStuPwd: function(e){
		this.setData({
			["userInfo.stuPwd"]: e.detail.value
		})
	},

	submitStuPwd: function(){
		console.log("提交密码");
		let that = this
		var collectionName = "weNjtech-userInfo"
		// 隐藏键盘
		API._hideKeyBoard()
		// 显示确认框
		wx.showLoading({
			title: '提交中'
		})
		cloudDB.GetWxCloudDB(collectionName, {
			_openid: app.globalData.openid
		}).then(res => {
			return cloudDB.UpdateWxCloudDB(collectionName, res.data[0]._id, {
				stuPwd: that.data.userInfo.stuPwd
			}, '更新密码')
		}).then(res => {
			wx.hideLoading()
			wx.showToast({
				title: '设置成功'
			})
			that.setData({
				canEditStuPwd: false
			})
		})
	}
})