// pages/kebiao/kebiao.js
const cloudDB = require("../../promise/wxCloudDB.js");
const {
    getKebiaoList,
    crawlKebiao
} = require("../../db/kebiaoDB.js");
const cloudFun = require("../../promise/wxCloudFun.js")
const cloudStore = require("../../promise/wxCloudStore.js")
const API = require("../../promise/wxAPI.js")
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        current: 24, // 当前swiper被选中的序号，0开始，非显示出来的选中
        select: 1, // 被选中的周数，1开始，显示出来的选中
        week: [{
            id: 1,
            name: "周一"
        }, {
            id: 2,
            name: "周二"
        }, {
            id: 3,
            name: "周三"
        }, {
            id: 4,
            name: "周四"
        }, {
            id: 5,
            name: "周五"
        }, {
            id: 6,
            name: "周六"
        }, {
            id: 7,
            name: "周日"
        }],
        weekSelect: 1, // 星期
        kebiaoList: [],
        showList: [],
        year: '2021-2022',
        term: '一',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        // 判断当前第几周
        let start_date = new Date("2022-02-21 00:00:00")
        let now_date = new Date()
        let term_week = parseInt((now_date.getTime() - start_date.getTime()) / (86400000 * 7) + 1)
        term_week = term_week < 20 ? term_week : 20
        // 判断星期几
        let week = now_date.getDay()
        week = week ? week : 7
        // 更新视图
        this.setData({
            weekSelect: week,
            select: term_week,
            current: (term_week - 3 + 26) % 26
        })
        // 判断是否有用户的学号和密码信息
        if (app.globalData.hasUserInfo != true ||  app.globalData.localUserInfo.stuNum == "" || app.globalData.localUserInfo.stuNum == null || app.globalData.localUserInfo.stuPwd == "" || app.globalData.localUserInfo.stuPwd == null) {
            return API.ShowModal('缺少信息', '请至"我的页面/编辑资料"检查是否完善学号和教务处密码，这将用于获取您的课表！点击确定将自动跳转', false).then(() => {
                wx.switchTab({
                    url: '/pages/me/me',
                })
            })
        } else {
            wx.showLoading({
                title: '加载中'
            })
            // 获取云端数据
            getKebiaoList(app.globalData.openid).then(res => {
                // 云端有数据
                // 数据可能过期，判断是否为当前学期
                if (that.isExpire(res.data[0].year, res.data[0].term)){
                    console.log("数据库课表未过期");
                    return res.data[0]
                }else{
                    console.log("数据库课表过期");
                    wx.hideLoading().then(() => {
                        API.ShowToast('课表过期,重新爬取', 'none', 2000).then(() => {
                            wx.showLoading({
                                title: '教务处爬取中'
                            })
                        })
                    })
                    return crawlKebiao(app.globalData.openid)
                }
            }, () => {
                console.log("数据库课表无信息");
                // 云端无数据,服务器端爬取数据
                wx.hideLoading().then(() => {
                    API.ShowToast('初次加载,耗时较长', 'none', 2000).then(() => {
                        wx.showLoading({
                            title: '教务处爬取中'
                        })
                    })
                })
                return crawlKebiao(app.globalData.openid)
            }).then(res => {
                console.log("设置数据");
                wx.hideLoading().then(() => {
                    API.ShowToast('成功', 'success')
                })
                // 设置课表数据
                that.setKebiaoList(res)
                // 过滤数据
                that.filterList()
            }).catch(err => {
                console.log("加载数据失败", err);
                wx.hideLoading().then(() => {
                    API.ShowToast('失败', 'error')
                })
            })
        }
    },

    /**
     * 转发
     */
    onShareAppMessage() {
        return {
            title: '我的课表',
            path: '/pages/kebiao/kebiao',
        }
    },

    isExpire: function(year, term){
        // 获取当前年、月
        let now_year = new Date().getFullYear()
        let now_month = new Date().getMonth() + 1
        let now_term = 3
        // 如果月份在1-7月，则年份减1
        if (now_month >= 1 && now_month <= 7){
            now_year -= 1
        }
        // 如果月份在2-7则为第二学期
        if(now_month >= 2 && now_month <= 7){
            now_term = 12
        }
        // 判断数据是否过期
        return now_year == year && now_term == term
    },

    /**
     * 设置全局课表信息
     * @param {*} res 
     */
    setKebiaoList: function (res) {
        this.setData({
            year: '' + res.year + '-' + parseInt(res.year + 1),
            term: res.term == 3 ? '一' : '二'
        })
        if (res.data.length == 0) {
            return
        } else {
            this.data.kebiaoList = res.data
        }
    },

    /**
     * 从所有数据中过滤出要展示的数据
     * @param {*} term_week 周数
     * @param {*} week 星期
     */
    filterList: function () {
        // 过滤数据
        let term_week = this.data.select
        let week = this.data.weekSelect
        console.log("过滤数据", term_week, week)
        let _list = this.data.kebiaoList.filter(function (x) {
            if (x["week"] == week && x["term_week"].indexOf(term_week) != -1) {
                return true
            } else {
                return false
            }
        })
        // 根据每日上课时间排序升序
        let compare = function (x, y) {
            if (x["time"][0] < y["time"][0]) {
                return -1;
            } else if (x["time"][0] > y["time"][0]) {
                return 1;
            } else {
                return 0;
            }
        }
        this.setData({
            showList: _list.sort(compare)
        })
    },

    SwiperChange: function (e) {
        this.setData({
            select: (parseInt(e.detail.current) + 2) % 26 + 1
        })
        // 过滤数据
        this.filterList()
    },

    /**
     * 选择周数
     */
    SelectWeeks: function (e) {
        this.setData({
            current: (e.currentTarget.dataset.id - 3 + 26) % 26,
        })
    },

    /**
     * 选择星期
     */
    SelectWeek: function (e) {
        this.setData({
            weekSelect: e.currentTarget.dataset.id
        })
        // 过滤数据
        this.filterList()
    },

    refresh: function(e){
        let that = this
        let time = wx.getStorageSync('pre_refresh_kebiao_time')
        let now_time = new Date().getTime()
        // 不用判断time为空就可以直接相减
        let deltaT = parseInt((now_time - time) / (1000 * 60 * 60))
        if (deltaT < 24 ){
            // 禁止刷新
            return API.ShowModal('冷却期未到', '冷却期间还有'+parseInt(24-deltaT)+'小时，在此期间不可以刷新课表', false)
        }
        // 除此以外可以刷新
        // 判断刷新冷却期
        return API.ShowModal('刷新课表', '刷新课表将从教务处重新获取新的课表。为维护服务器正常使用，每48h仅可刷新一次，敬请谅解！').then(()=>{
            // 设置本地缓存
            wx.setStorageSync('pre_refresh_kebiao_time', now_time)
            // 显示加载
            wx.showLoading({
              title: '获取中'
            })
            // 刷新数据,从服务器重新获取
            crawlKebiao(app.globalData.openid).then(res => {
                wx.hideLoading().then(() => {
                    API.ShowToast('成功', 'success')
                })
                // 设置课表数据
                that.setKebiaoList(res)
                // 过滤数据
                that.filterList()
            }).catch(err => {
                console.log("刷新课表失败", err);
                wx.hideLoading().then(() => {
                    API.ShowToast('失败', 'error')
                })
            })
        })
    }
})