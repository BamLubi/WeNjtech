// pages/zutuanDetail/zutuanDetail.js
const { msgSecCheck } = require("../../promise/wxCloudFun.js")
const { addZutuan } = require("../../db/zutuanDB.js")
const API = require("../../promise/wxAPI.js")
const {	checkIllegalText } = require("../../utils/util.js")
const { date2YMD } = require("../../utils/dateControl.js")
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		typePicker: ['拼车', '竞赛', '吃喝玩乐', '其他'],
		selectType: 0,
		num: 1,
		selectDate: '2021-08-22',
		nowDate: '2021-08-22',
		tel: '',
		detail: '',
		_id: null
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let date = date2YMD(new Date())
		// 判断是否有传递参数
		if (options.data == undefined || options.data == null || options.data == '') {
			this.setData({
				selectDate: date,
				nowDate: date
			})
		} else {
			options.data = JSON.parse(options.data)
			this.data._id = options.data._id
			this.setData({
				selectDate: options.data.deadTime,
				nowDate: date,
				selectType: this.data.typePicker.indexOf(options.data.type),
				num: options.data.num,
				tel: options.data.tel,
				detail: options.data.detail,
			})
		}
	},

	/**
	 * 类型改变
	 * @param {*} e 
	 */
	typeChange(e) {
		this.setData({
			selectType: e.detail.value
		})
	},

	/**
	 * 日期选择
	 * @param {*} e 
	 */
	dateChange(e) {
		this.setData({
			selectDate: e.detail.value
		})
	},

	/**
	 * 详情输入
	 * @param {*} e 
	 */
	detailInput: function (e) {
		this.setData({
			detail: checkIllegalText(e.detail.value)
		})
	},

	/**
	 * 联系方式输入
	 * @param {*} e 
	 */
	telInput: function (e) {
		this.setData({
			tel: checkIllegalText(e.detail.value)
		})
	},

	/**
	 * 人数输入
	 * @param {*} e 
	 */
	numInput: function (e) {
		if (e.detail.value == null || e.detail.value <= 0) {
			this.setData({
				num: 1
			})
		} else {
			this.data.num = e.detail.value
		}
	},

	/**
	 * 确认
	 */
	confirm: function () {
		let that = this
		// 1. 检查所有参数是否补齐
		let type = this.data.typePicker[this.data.selectType]
		let num = this.data.num
		let tel = this.data.tel
		let detail = this.data.detail
		let date = this.data.selectDate
		let _id = this.data._id
		// 2. 判断内容是否为空
		if (tel == '' || tel == null || detail == '' || detail == null) {
			console.log("here");
			return API.ShowModal('未完善信息', '请确保您已经填写所有信息!', false)
		}
		// 3. 接入内容安全
		wx.showLoading({
			title: '检测中',
		})
		let content = '' + tel + detail
		msgSecCheck(app.globalData.openid, content).then(res => {
			wx.hideLoading().then(res=>{
				wx.showLoading({
				  title: '发布中',
				})
				// 4. 上传
				addZutuan(_id, app.globalData.localUserInfo, type, num, tel, detail, date).then(res=>{
					wx.hideLoading().then(()=>{
						API.ShowToast('发布成功', 'success').then(()=>{
							// 返回上一页
							that.cancel()
						})
					})
				}).catch(err=>{
					console.log(err)
					wx.hideLoading().then(()=>{
						return API.ShowToast('发布失败', 'error')
					})
				})
			})
		}, res => {
			wx.hideLoading().then(()=>{
				return API.ShowModal('安全审查未通过', '请检查您的言论是否有不合法的信息!', false)
			})
		}).catch(err => {
			console.log(err)
			wx.hideLoading().then(()=>{
				API.ShowToast('网络错误', 'error')
			})
		})
	},

	/**
	 * 取消
	 */
	cancel: function () {
		wx.navigateBack({
			delta: 0,
		})
	}
})