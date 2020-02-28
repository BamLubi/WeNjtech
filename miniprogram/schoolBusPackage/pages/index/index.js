// miniprogram/schoolBusPackage/pages/index/index.js
const dateControl = require("../../../utils/dateControl.js")
const cloudDB = require("../../../promise/wxCloudDB.js")
const busDB = require("../../utils/schoolBusDB.js")

const app = getApp()
const db = wx.cloud.database()

Page({
    /**
     * 页面的初始数据
     */
    data: {
        windowHeight: null,
        windowWidth: null,
        todayDate: {}, //今天
        selectDate: {}, //用户选择的时间,默认为当日
        busLineShow: [], //用于显示的列表
        busLineShowLength: 0, //显示的班车列表的长度
        hasBus: true, //是否有班车
        hasBusInfo: '', //用于显示特殊信息
        position: ["校门", "东苑", "北苑", "同和", "象山", "亚青"],
        positionStartIndex: 4, //起点序号
        positionEndIndex: 0, //终点序号
        direction: 0, //方向0为象山开往校门方向，1为校门开往象山方向
        isChangePlace: false, //是否显示地点选择模态窗
        isChangeDate: false, //是否显示日期选择模态窗
        dict: null, //字典
        scrollTopNum: 0, //控制scroll-view的顶部距离
        hasMoreBus: true,//是否有更多的班车信息
        isBusLoading: false,//班车信息是否在加载
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this
        // 设置屏幕宽高
        that.setData({
            windowHeight: app.globalData.systemInfo.windowHeight + app.globalData.tabBarHeight,
            windowWidth: app.globalData.systemInfo.windowWidth
        })
        // 设置时间
        let nowDate = new Date()
        this.setData({
            selectDate: {
                year: nowDate.getFullYear(),
                month: (nowDate.getMonth() + 1) < 9 ? ("0" + (nowDate.getMonth() + 1)) : (nowDate.getMonth() + 1),
                day: nowDate.getDate() < 9 ? ("0" + nowDate.getDate()) : nowDate.getDate(),
                hour: nowDate.getHours(),
                minutes: nowDate.getMinutes(),
                week: nowDate.getDay(),
                weekZN: "今天",
                dateZN: (nowDate.getMonth() + 1) + "月" + nowDate.getDate() + "日"
            }
        })
        this.setData({
            todayDate: JSON.parse(JSON.stringify(this.data.selectDate)) //深拷贝对象
        })
        // 下载字典
        cloudDB.GetWxCloudDB('busDict', {
            name: '字典'
        }).then(res => {
            that.setData({
                dict: res.data[0]
            })
            if (that.getDictCallback) {
                that.getDictCallback()
            }
        })
        // 连接数据库并设置班车信息
        if (this.data.dict) {
            this.setBusLine()
        } else {
            this.getDictCallback = res => {
                this.setBusLine()
            }
        }
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

    },
    /**
     * 产生班车列表
     */
    setBusLine: function() {
        // 准备数据
        var that = this
        let season = this.data.dict.season
        let direction = this.data.direction == 0 ? 'forward' : 'reverse'
        let time = (this.data.selectDate.hour * 100 + this.data.selectDate.minutes - 5) / 100
        time = time.toFixed(2)
        // 设置工作日
        let week = null
        if (this.data.selectDate.week == 0 || this.data.selectDate.week == 6) 
            week = 'weekend'
        else
            week = 'workingDay'
        // 设置线路
        let line = null
        if (this.data.positionStartIndex == 5 || this.data.positionEndIndex == 5) {
            line = ['busLine_2']
        } else if (this.data.positionStartIndex == 4 || this.data.positionEndIndex == 4) {
            line = ['busLine_1']
        } else {
            line = ['busLine_1', 'busLine_2']
        }
        // 下载
        that.setData({
            isBusLoading: true
        })
        busDB.DownLoadBusLine(season, direction, week, line, time, this.data.busLineShowLength)
            .then(res => {
                let length = this.data.busLineShowLength + res.data.length
                if(res.data.length == 0){
                    that.setData({
                        hasMoreBus: false
                    })
                }
                if (length == 0) {
                    this.setData({
                        hasBus: false,
                        hasBusInfo: '当前班车休息中'
                    })
                } else {
					let list = that.data.busLineShow.concat(res.data)
                    that.setData({
                        busLineShow: list,
                        busLineShowLength: length,
						hasBus: true,
						hasBusInfo: '班车信息加载中。。。'
                    })
                }
                that.setData({
                    isBusLoading: false
                })
            })
    },
    /**
     * 更改方向
     */
    ChangeDirection: function() {
        console.log("更改方向")
        this.setData({
            positionStartIndex: this.data.positionEndIndex,
            positionEndIndex: this.data.positionStartIndex,
        })
    },
    /**
     * 查询按钮
     */
    Search: function() {
        // 判断是否可查路线
        console.log("开始" + this.data.positionStartIndex)
        console.log("结束" + this.data.positionEndIndex)
        let stIndex = this.data.positionStartIndex
        let edIndex = this.data.positionEndIndex
        if ((stIndex == 2 && edIndex == 5) || (stIndex == 5 && edIndex == 2)) {
            this.setData({
                hasBus: false,
                hasBusInfo: "该路线没有直达班车，推荐更换地点为‘象山’"
            })
        } else if (stIndex == edIndex) {
            this.setData({
                hasBus: false,
                hasBusInfo: "你在逗我吗？原地转一圈就到了"
            })
        } else if ((stIndex == 4 && edIndex == 5) || (stIndex == 5 && edIndex == 4) || (stIndex == 3 && edIndex == 5) || (stIndex == 5 && edIndex == 3) || (stIndex == 3 && edIndex == 4) || (stIndex == 4 && edIndex == 3)) {
            this.setData({
                hasBus: false,
                hasBusInfo: "距离太近，建议步行哦"
            })
        } else {
            this.setData({
                direction: parseInt(this.data.positionEndIndex) - parseInt(this.data.positionStartIndex) < 0 ? 0 : 1
            })
            // 赋空值
            this.setData({
                busLineShow: [],
				busLineShowLength: 0
            })
            // 设置有更多信息可取
            this.setData({
                hasMoreBus: true
            })
            // 获取班车信息
            this.setBusLine()
        }
        // 隐藏地点选择模态框
        this.HidePlaceChangeMask()
    },
    /**
     * 更改时间,更改selectDate里的年月日
     */
    DateChange(dateString) {
        console.log("日期改变")
        let selectDate = new Date(dateString)
        let date = dateString.split('-')
        // 重新设置年月日星期
        this.setData({
            ["selectDate.year"]: date[0],
            ["selectDate.month"]: date[1],
            ["selectDate.day"]: date[2],
            ["selectDate.week"]: selectDate.getDay(),
            ["selectDate.dateZN"]: parseInt(date[1]) + "月" + date[2] + "日"
        })
        this.setData({
            ["selectDate.weekZN"]: dateControl.isTodayORTomorrow(this.data.selectDate, this.data.todayDate)
        })
        // 如果不是今天，则将时间设置为07:00
        if (this.data.selectDate.weekZN != "今天") {
            this.setData({
                ["selectDate.hour"]: 7,
                ["selectDate.minutes"]: 0
            })
        } else {
            let nowDate = new Date()
            this.setData({
                ["selectDate.hour"]: nowDate.getHours(),
                ["selectDate.minutes"]: nowDate.getMinutes(),
                ["todayDate.hour"]: nowDate.getHours(),
                ["todayDate.minutes"]: nowDate.getMinutes()
            })
        }
    },
    /**
     * 更改时间,更改selectDate里的年月日
     */
    TimeChange(e) {
        console.log("时间改变")
        let time = e.detail.value.split(':')
        this.setData({
            ["selectDate.hour"]: parseInt(time[0]),
            ["selectDate.minutes"]: parseInt(time[1])
        })
    },
    /**
     * 更改起点
     */
    ChangeStartPosition(e) {
        console.log("修改起点：" + e.detail.value)
        this.setData({
            positionStartIndex: e.detail.value
        })
    },
    /**
     * 更改终点
     */
    ChangeEndPosition(e) {
        console.log("修改终点：" + e.detail.value)
        this.setData({
            positionEndIndex: e.detail.value
        })
    },
    /**
     * 显示地点选择遮罩层
     */
    ShowPlaceChangeMask: function() {
        console.log("显示遮罩")
        this.setData({
            isChangePlace: true
        })
        // 若日期为今天，则时间设置为当前时间
        if (this.data.selectDate.weekZN == "今天") {
            let nowDate = new Date()
            this.setData({
                ["selectDate.hour"]: nowDate.getHours(),
                ["selectDate.minutes"]: nowDate.getMinutes(),
                ["todayDate.hour"]: nowDate.getHours(),
                ["todayDate.minutes"]: nowDate.getMinutes()
            })
        }
    },
    /**
     * 隐藏地点选择遮罩层
     */
    HidePlaceChangeMask: function() {
        console.log("隐藏遮罩")
        this.setData({
            isChangePlace: false
        })
    },
    /**
     * 加一天
     */
    AddDay: function() {
        console.log("用户点击：加一天")
        let day = this.data.selectDate.year + '-' + this.data.selectDate.month + '-' + this.data.selectDate.day;
        day = dateControl.mathChangeDate(day, '+', 1)
        // 改变日期
        this.DateChange(day)
        // 查询
        this.Search()
    },
    /**
     * 减一天
     */
    MinusDay: function() {
        console.log("用户点击：减一天")
        // 如果当前日期为今天则不可减
        if (this.data.selectDate.weekZN == "今天") {
            return
        } else {
            let day = this.data.selectDate.year + '-' + this.data.selectDate.month + '-' + this.data.selectDate.day;
            day = dateControl.mathChangeDate(day, '-', 1)
            // 改变日期
            this.DateChange(day)
            // 查询
            this.Search()
        }
    },
    /**
     * 隐藏时间选择遮罩层
     */
    HideDateChangeMask: function() {
        console.log("隐藏遮罩")
        this.setData({
            isChangeDate: false
        })
    },
    /**
     * 显示时间选择遮罩层
     */
    ShowDateChangeMask: function() {
        console.log("显示遮罩")
        this.setData({
            isChangeDate: true
        })
    },
    /**
     * 日历上的日期被点击
     */
    onDayClick: function(e) {
        var that = this
        this.DateChange(e.detail.id)
        // 设置计时器
        setTimeout(function() {
            // 隐藏日历层
            that.HideDateChangeMask()
            // 查询
            that.Search()
        }, 200)
    },
	/**
	 * 监听页面滚动
	 */
    PageScroll: function(e) {
        this.backTop = this.selectComponent("#backTop")
        let scrollHeight = e.detail.scrollTop
        if (scrollHeight > this.data.windowHeight / 2) {
            this.backTop.show()
        } else {
            this.backTop.hide()
        }
    },
	/**
	 * 监听页面到达顶部
	 */
    ScrollToTop: function() {
        this.setData({
            scrollTopNum: 0
        })
    }
})

// 对象构造器，未用
function busLine(childLine, dict) {
    // 开始时间
    let stNum = parseFloat(childLine.startTime).toFixed(2).split(".");
    this.startTime = stNum[0] + ":" + stNum[1];

    // 结束时间
    let edNum = parseFloat(childLine.endTime).toFixed(2).split(".");
    this.endTime = edNum[0] + ":" + edNum[1];

    // 备注信息
    // this.info = childLine.info;

    // 方向，0：象山开往校门口，1：校门口开往象山
    // this.direction = childLine.direction;

    // 状态，1：准点发车，3：三车循环，4：四车循环
    this.status = childLine.status;

    //线路ID，0为象山线，1为亚青线
    this.lineID = childLine.line == 'busLine_1' ? 0 : 1;

    // 线路名称
    this.line = dict[childLine.line];

    // 站点名称
    this.site = dict[childLine.site];
}