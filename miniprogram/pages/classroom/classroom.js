// miniprogram/pages/classroom/classroom.js
const cloudDB = require("../../promise/wxCloudDB.js")
const API = require("../../promise/wxAPI.js")
const classroomDB = require("../../utils/classroomDB.js")

const app = getApp()
const db = wx.cloud.database()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		scrollTopNum: 0,
		listHeight: 0,
		cardCur: 0, // 顶部轮播图片标签
		lh: ["全部学区", "厚学楼", "浦江楼", "仁智楼", "同和楼"],
		tab_lh: [1, 0, 0, 0, 0],
		time: ["全部时间", "1-2", "3-4", "5-6", "7-8", "9-10"],
		tab_time: [1, 0, 0, 0, 0, 0],
		lc: ["全部楼层", "1", "2", "3", "4", "5", "6"],
		tab_lc: [1, 0, 0, 0, 0, 0, 0],
		isFixedNav: false,
		dict: {},
		classroomList: [],
		classroomListLength: 0,
		isLoading: false, // 是否正在加载
		hasMore: true, // 是否有更多数据
		mode: 0, // 模式选择(默认:0, 考研:1)
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let that = this

		// 下载字典
		cloudDB.GetWxCloudDB('weNjtech-publicDict', {
			name: 'forStudy'
		}).then(res => {
			that.setData({
				dict: res.data[0]
			})
			// 获取字典后，设置回调
			if (that.getDictCallback) {
				that.getDictCallback()
			}
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		// 页面渲染完成后，再获取大量信息，以避免渲染拥堵
		// 获取空教室信息
		this.setEmptyClassroom()

		// 设置scroll-view的高度，由当前页面的高度减去工具栏的高度
		wx.createSelectorQuery().select('#tools').boundingClientRect(res => {
			this.setData({
				listHeight: app.globalData.systemInfo.windowHeight - res.height + 'px'
			})
		}).exec()
	},

	/**
	 * 顶部轮播图片的触摸
	 * @param {*} e 
	 */
	cardSwiper(e) {
		this.setData({
			cardCur: e.detail.current
		})
	},

	/**
	 * 教室切换
	 * @param {*} e 
	 */
	tabSelect(e) {
		// 如果上一次的请求未结束，不处理这次的请求
		if (this.data.isLoading) {
			API.ShowToast("快的我都来不及了", "none", 1000)
			return
		}
		// 正式请求
		let id = e.currentTarget.dataset.id
		let arr = e.currentTarget.dataset.arr
		// 处理“全部”选项的事项
		// 选中了除第一个以外的内容
		if (this.data[arr][0] == 1 && id != 0) {
			this.setData({
				[arr + '[0]']: 0
			})
		}
		// 选中全部选项，其他全部变为0
		if (this.data[arr][0] == 0 && id == 0) {
			for (let i = 1; i < this.data[arr].length; i++) {
				this.setData({
					[arr + '[' + i + ']']: 0
				})
			}
		}
		// 设置该tab变色
		this.setData({
			[arr + '[' + id + ']']: !this.data[arr][id]
		})
		// 重置查询参数
		this.setData({
			hasMore: true,
			scrollTopNum: 0
		})
		this.data.classroomList = []
		this.data.classroomListLength = 0
		// 获取空教室信息
		this.setEmptyClassroom()
	},

	/**
	 * 监听页面滚动
	 * @param {}  页面滚动长度
	 */
	onPageScroll(e) {
		// 获取需要固定区域的top值
		wx.createSelectorQuery().select('#fix-area').boundingClientRect(res => {
			if (res.top <= 5 && !this.data.isFixedNav) {
				this.setData({
					isFixedNav: true
				})
			}
		}).exec()
	},

	/**
	 * 监听固定区域的触摸开始
	 */
	FixAreaTouchStart: function(e){
		let y = e.changedTouches[0].pageY
		this.data.touch_start = y
	},

	/**
	 * 监听固定区域的触摸结束，并在一定条件下接触锁定模式
	 */
	FixAreaTouchEnd: function(e){
		let y = e.changedTouches[0]["pageY"]
		// 获取scroll-view滚动条高度
		wx.createSelectorQuery().select('#scrollview').scrollOffset(res => {
			// 当滑动距离大于125，且处于锁定模式，且滚动列表已经置顶
			// 则解除锁定
			if(y - this.data.touch_start > 125 && this.data.isFixedNav && res.scrollTop <= 2){
				this.setData({
					isFixedNav: false
				})
			}
		}).exec()
	},

	/**
	 * scroll-view组件滑动至底部获取数据
	 */
	ScrollToLower: function () {
		// 如果无数据了就不要再发请求了
		if (!this.data.hasMore) return
		// 节流
		if (!this.data.isLoading) {
			this.setEmptyClassroom()
		}
	},

	/**
	 * 设置空教室
	 */
	setEmptyClassroom() {
		let that = this
		// 设置加载中
		that.setData({
			isLoading: true
		})
		// 处理选项信息
		// 楼号信息
		let building = []
		for (let i = 0; i < that.data.tab_lh.length; i++) {
			if (i == 0 && that.data.tab_lh[i] == 1) {
				// 选择全部
				building = JSON.parse(JSON.stringify(that.data.lh))
			} else if (that.data.tab_lh[i] == 1) {
				// 单独的楼号
				building.push(that.data.lh[i])
			}
		}
		// 如果存在浦江楼选项，则拓展为浦江A楼、浦江B楼、浦江C楼
		if (that.data.tab_lh[2] == 1 || that.data.tab_lh[0] == 1) {
			building.push("浦江A楼")
			building.push("浦江B楼")
			building.push("浦江C楼")
		}
		// 时间信息
		let time = []
		for (let i = 0; i < that.data.tab_time.length; i++) {
			if (i == 0 && that.data.tab_time[i] == 1) {
				// 选择全部
				time = [2, 4, 6, 8, 10]
			} else if (that.data.tab_time[i] == 1) {
				// 单独的楼号
				time.push(2 * i)
			}
		}
		// 楼层信息
		let lc = []
		for (let i = 0; i < that.data.tab_lc.length; i++) {
			if (i == 0 && that.data.tab_lc[i] == 1) {
				// 选择全部
				lc = [1, 2, 3, 4, 5, 6]
			} else if (that.data.tab_lc[i] == 1) {
				// 单独的楼层
				lc.push(i)
			}
		}
		// 设置每次获取数据的限制
		let limit = 10
		// 网络请求
		classroomDB.DownLoadClassroom(building, time, lc, that.data.classroomListLength, limit, that.data.mode).then(res => {
			let length = that.data.classroomListLength + res.length
			// 没有更多数据
			if (res.length == 0 || res.length < limit) {
				that.setData({
					hasMore: false
				})
			}
			// 如果length==0则代表没有数据，不另设变量
			let list = that.data.classroomList.concat(res)
			that.setData({
				classroomList: list,
				classroomListLength: length,
				isLoading: false
			})
		})
	},

	/**
	 * 切换模式
	 */
	changeMode() {
		// 更改mode
		this.setData({
			mode: !this.data.mode
		})
		console.log("[查询空闲教室] 模式", this.data.mode)
		// 重置查询参数
		this.setData({
			hasMore: true,
			scrollTopNum: 0
		})
		this.data.classroomList = []
		this.data.classroomListLength = 0
		// 获取新的数据
		this.setEmptyClassroom()
	}
})