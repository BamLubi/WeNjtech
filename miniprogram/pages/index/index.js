// miniprogram/pages/index/index.js

var util = require('../../utils/util.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        time: {},
        nowTime: 0,
        busLineShow: [],
        hasBus: false,
        stName: "象山",
        edName: "校门",
        direction: 0,
        allBusInfo: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var time = new Date()
        this.setData({
            time: {
                year: time.getFullYear(),
                month: time.getMonth() + 1,
                day: time.getDate(),
                hour: time.getHours(),
                minutes: time.getMinutes(),
                seconds: time.getSeconds(),
                week: time.getDay()
            },
            nowTime: parseInt(time.getHours())*100 + parseInt(time.getMinutes())
            // nowTime: 2107
        })
        // 连接数据库并设置班车信息
        this.connectDB();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    /**
     * 用户下拉刷新
     */
    onPullDownRefresh() {
        // 上拉刷新
        if (!this.loading) {
            this.getBusLine()
            wx.stopPullDownRefresh()
        }
    },
    /**
     * 连接数据库，下载班车信息
     */
    connectDB: function() {
        var that = this
        console.log("准备连接数据库")
		// 显示加载框
		wx.showLoading({
			title: '加载中',
		})
		// 获取信息
        const db = wx.cloud.database()
        db.collection('schoolBusTable').doc('f0b862af-d862-4a8a-937a-a3ce4f221fdc').get({
            success: function(res) {
                console.log("下载班车信息成功")
				// 更具星期设置变量
				if (that.data.time.week == 6 || that.data.time.week == 7 ){
					// 周末
					that.setData({
						allBusInfo: res.data.weekendData
					})
				}else{
					// 工作日
					that.setData({
						allBusInfo: res.data.workingDayData
					})
				}
				// 产生班车列表
				that.setBusLine()
				// 隐藏加载框
				wx.hideLoading()
            }
        })
    },
    /**
     * 产生班车列表
     */
    setBusLine: function() {
		console.log("准备生成班车列表")
        let data = this.data.allBusInfo;
        let ans = new Array();
        // 遍历
        for (var i = 0; i < data.length; i++) {
            let st = parseInt(parseFloat(data[i].startTime).toFixed(2) * 100);
			let ed = parseInt(parseFloat(data[i].endTime).toFixed(2) * 100);
            // 筛选当前时间之后的班车
			if (parseInt(ed - this.data.nowTime) >= 0) {
				// 方向一致，或为循环车
                if (data[i].direction == this.data.direction || data[i].status != 1) {
                    ans.push(new busLine(data[i]))
                }
            }
        }
        // 赋值
        this.setData({
            busLineShow: ans
        })
		console.log("生成班车列表成功")
		// 若班车信息为空，则设置无班车
		if (ans.length != 0) {
			this.setData({
				hasBus: true
			})
		}
    },
    /**
     * 更改方向
     */
    changeDirection: function() {
        console.log("更换方向")
        this.setData({
            direction: !this.data.direction
        })
        if (this.data.direction == 1) {
            this.setData({
                stName: "校门",
                edName: "象山"
            })
        } else if (this.data.direction == 0) {
            this.setData({
                stName: "象山",
                edName: "校门"
            })
        }
        // 赋空值
        this.setData({
            busLineShow: []
        })
        // 获取班车信息
        this.setBusLine()
    }
})

// 对象构造器
function busLine(line) {
    // 开始时间
    let stNum = parseFloat(line.startTime).toFixed(2).split(".");
    this.startTime = stNum[0] + ":" + stNum[1];
    // 结束时间
    let edNum = parseFloat(line.endTime).toFixed(2).split(".");
    this.endTime = edNum[0] + ":" + edNum[1];
    // 备注信息
    // this.info = line.info;
    // 方向，0：象山开往校门口，1：校门口开往象山
    this.direction = line.direction;
    // 状态，1：准点发车，3：三车循环，4：四车循环
    this.status = line.status;
}