// pages/news/news.js
const cloudFun = require("../../promise/wxCloudFun.js")
const cloudDB = require("../../promise/wxCloudDB.js")
const cloudStore = require("../../promise/wxCloudStore.js")
const API = require("../../promise/wxAPI.js")
const app = getApp()

Page({
    data: {
        notice: [],
        hasMoreNotice: true,
        isLoading: false,
    },

    onLoad() {
        // 获取新闻列表
        this.getNoticeList()
    },

    /**
     * 获取通知列表数据
     */
    getNoticeList: function () {
        let that = this
        let num = 12
        let page = Math.ceil(that.data.notice.length / num)
        wx.showLoading({
            title: '加载中',
        })
        that.setData({
            isLoading: true
        })
        /**
         * 调用云函数
         */
        return cloudFun.CallWxCloudFun('getNoticeList', {
            len: num * page,
            num: num
        }).then(res => {
            that.setData({
                notice: that.data.notice.concat(res.data),
                isLoading: false
            })
            // 判断是否有更多数据
            if (res.data.length < num) {
                that.setData({
                    hasMoreNotice: false
                })
            }
            wx.hideLoading()
        }).catch(res => {
            wx.hideLoading()
            console.log("获取新闻失败", res)
        })
    },

    /**
     * 显示通知详情页
     */
    showNotice: function (e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/newsDetail/newsDetail?id=' + id,
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        // 如果无数据了就不要再发请求了
        if (!this.data.hasMoreNotice) return;
        // 节流
        if (!this.data.isLoading) {
            this.getNoticeList()
        }
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh: function () {
        // 置空源数据
        this.setData({
            notice: []
        })
        // 获取新闻
        this.getNoticeList().then(res => {
            wx.stopPullDownRefresh()
        })
    }
})