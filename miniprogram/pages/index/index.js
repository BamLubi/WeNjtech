// miniprogram/pages/index/index.js
var util = require('../../utils/util.js')
const dateControl = require("../../utils/dateControl.js")

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
        hasBus: true, //是否有班车
        hasBusInfo: '', //用于显示特殊信息
        position: ["校门", "东苑", "北苑", "同和", "象山", "亚青"],
        positionStartIndex: 4, //起点序号
        positionEndIndex: 0, //终点序号
        direction: 0, //方向0为象山开往校门方向，1为校门开往象山方向
        allBusInfo: null, //所有班车信息
        isChangePlace: false, //是否显示地点选择模态窗
        dict: [] //字典
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this
        // 设置屏幕宽高
		that.setData({
			windowHeight: app.globalData.systemInfo.windowHeight,
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
        db.collection('schoolBusTable').doc('08647083-7954-4d1e-932c-6f8002e1c6c6').get({
            success: function(res) {
                console.log("下载-字典-信息成功")
                that.setData({
                    dict: res.data
                })
            }
        })
        // 连接数据库并设置班车信息
		this.downloadBusInfo();
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
     * 连接数据库，下载班车信息
     */
    downloadBusInfo: function() {
        var that = this
        // 显示加载框
        wx.showLoading({
            title: '加载中',
        })
        // 获取信息
        db.collection('schoolBusTable').doc('0ea5f45b-d433-4608-a2b2-ce94309ac44a').get({
            success: function(res) {
                console.log("下载-班车-信息成功")
                let busInfo = null
                // 更具星期设置变量
                if (that.data.selectDate.week == 6 || that.data.selectDate.week == 0) {
                    // 周末
                    if (that.data.direction == 0) {
                        busInfo = res.data.weekendData.forward
                        console.log("周末-正向")
                    } else {
                        console.log("周末-反向")
                        busInfo = res.data.weekendData.reverse
                    }
                } else {
                    // 工作日
                    if (that.data.direction == 0) {
                        console.log("工作日-正向")
                        busInfo = res.data.workingDayData.forward
                    } else {
                        console.log("工作日-反向")
                        busInfo = res.data.workingDayData.reverse
                    }
                }
                that.setData({
                    allBusInfo: busInfo
                })
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
        let nowTime = parseInt(this.data.selectDate.hour) * 100 + parseInt(this.data.selectDate.minutes)
        for (var i = 0; i < data.length; i++) {
            let st = parseInt(parseFloat(data[i].startTime).toFixed(2) * 100);
            let ed = parseInt(parseFloat(data[i].endTime).toFixed(2) * 100);
            // 筛选当前时间之后的班车
            if (parseInt(ed - nowTime) >= -5) {
                // 限定亚青线和象山线
                if (this.data.positionStartIndex == 5 || this.data.positionEndIndex == 5) {
                    if (data[i].line == 'busLine_2') {
                        ans.push(new busLine(data[i], this.data.dict))
                    }
                } else if (this.data.positionStartIndex == 4 || this.data.positionEndIndex == 4) {
                    if (data[i].line == 'busLine_1') {
                        ans.push(new busLine(data[i], this.data.dict))
                    }
                } else {
                    ans.push(new busLine(data[i], this.data.dict))
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
                hasBus: true,
                hasBusInfo: '班车信息加载中。。。'
            })
        } else {
            this.setData({
                hasBus: false,
                hasBusInfo: '当前班车休息中'
            })
        }
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
                busLineShow: []
            })
            // 连接数据库
			this.downloadBusInfo()
            // 获取班车信息
            this.setBusLine()
        }
        // 隐藏模态框
        this.HideMask()
    },
    /**
     * 更改时间,更改selectDate里的年月日
     */
    DateChange(e) {
        console.log("日期改变")
        let selectTime = new Date(e.detail.value)
        let date = e.detail.value.split('-')
        // 重新设置年月日星期
        this.setData({
            ["selectDate.year"]: date[0],
            ["selectDate.month"]: date[1],
            ["selectDate.day"]: date[2],
            ["selectDate.week"]: selectTime.getDay(),
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
     * 显示遮罩层
     */
    ShowMask: function() {
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
     * 隐藏遮罩层
     */
    HideMask: function() {
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
        let ans = new package_detail_value(dateControl.mathChangeDate(day, '+', 1))
        // 改变日期
        this.DateChange(ans)
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
            let ans = new package_detail_value(dateControl.mathChangeDate(day, '-', 1))
            // 改变日期
            this.DateChange(ans)
            // 查询
            this.Search()
        }
    }
})

// 对象构造器
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

// 对象构造器，构造e.detail.value，用于DateChange()方法的复用
function package_detail_value(info) {
    function package_value(info) {
        this.value = info
    }
    this.detail = new package_value(info)
}