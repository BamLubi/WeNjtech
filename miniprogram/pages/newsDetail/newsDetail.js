// pages/newsDetail/newsDetail.js
const newsDB = require("../../db/newsDB.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        notice: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        var id = options.id
        wx.showLoading({
            title: '加载中',
        })
        // 获取新闻
        newsDB.getNewsDetail(id).then(res => {
            that.setData({
                notice: res
            })
            wx.hideLoading()
        }).catch(err => {
            console.log("请求失败", err)
        })
    }
})