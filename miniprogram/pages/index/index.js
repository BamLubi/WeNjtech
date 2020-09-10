// miniprogram/pages/index/index.js
const cloudFun = require("../../promise/wxCloudFun.js")
const cloudDB = require("../../promise/wxCloudDB.js")
const cloudStore = require("../../promise/wxCloudStore.js")
const API = require("../../promise/wxAPI.js")
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardCur: 0,
        services: [{
            title: "班车时刻",
            name: "BusLine",
            type: "navigator",
            url: "/pages/schoolBus/schoolBus",
            bg: "bg-cyan"
        }, {
            title: "去哪学习",
            name: "ForStudy",
            type: "navigator",
            url: "/pages/classroom/classroom",
            bg: "bg-green"
        }, {
            title: "校园Q&A",
            name: "CampusQ&A",
            type: "navigator",
            url: "/pages/campusQ&A/campusQ&A",
            bg: "bg-green"
        }, {
            title: "太南课表",
            name: "TooNjtech",
            type: "button",
            bindtap: "getAPK",
            bg: "bg-olive"
        }],
        dict: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        // 云端获取dict
        cloudDB.GetWxCloudDB("weNjtech-publicDict", {
            name: "miniNjtechDict"
        }).then(res => {
            that.setData({
                dict: res.data[0]
            })
        })
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
     * 下载apk
     */
    getAPK: function () {
        let savedFilePath = ''
        API.ShowModal('', "本功能由@AutoKaKa开发\n为独立APP非小程序\n即将跳转下载...", true, '取消下载', '继续下载').then(res => {
            console.log("[home] [太南课表] [下载]")
            wx.showLoading({
                title: '下载中'
            })
            return cloudStore.DownloadWxCloudStore("cloud://lyy-production.6c79-lyy-production-1258923430/太南课表.apk")
        }).then(res => {
            return API.SaveFile(res.tempFilePath, "太南课表.apk")
        }).then(res => {
            savedFilePath = res.savedFilePath
            wx.hideLoading()
            return API.ShowToast('下载成功', 'success', 1000)
        }).then(res => {
            setTimeout(function () {
                return API.HideToast()
            }, 1000)
        }).then(res => {
            return API.OpenDocument(savedFilePath)
        }).catch(err => {
            wx.hideLoading()
            return API.ShowToast('下载失败，链接已失效！', 'none', 1000)
        })
    },
})