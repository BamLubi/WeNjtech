// miniprogram/pages/me/me.js
const app = getApp()
const userInfoDB = require("../../utils/userInfoDB.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasUserInfo: false,
        openid: null,
        service: [{
            id: 0,
            name: "日志",
            show: false,
            type: "navigator",
            img: "/images/me/log.png",
            url: "/mePackage/pages/log/log"
        }, {
            id: 1,
            name: "编辑资料",
            show: true,
            type: "navigator",
            img: "/images/me/info.png",
            url: "/mePackage/pages/info/info"
        }, {
            id: 2,
            name: "意见反馈",
            show: true,
            type: "button",
            img: "/images/me/react.png",
            opentype: "feedback"
        }, {
            id: 3,
            name: "关于我们",
            show: true,
            type: "navigator",
            img: "/images/me/about.png",
            url: "/mePackage/pages/about/about"
        }]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 已经授权下，获取个人信息
        if (app.globalData.hasUserInfo) {
            this.setData({
                localUserInfo: app.globalData.localUserInfo,
                openid: app.globalData.openid,
                hasUserInfo: true,
            })
        } else {
            // 异步操作
            app.userInfoReadyCallback = res => {
                this.setData({
                    localUserInfo: app.globalData.localUserInfo,
                    openid: app.globalData.openid,
                    hasUserInfo: true,
                })
            }
        }
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
     * 授权
     */
    getUserInfo: function (e) {
        if (e.detail.userInfo) {
            app.getUserInfo()
        }
    },

    /**
     * 跳转页面
     */
    navigatePage: function (e) {
        console.log("[me] [跳转页面]", e.target.dataset.url)
        // 跳转编辑资料页面需保证全局由用户信息
        if (e.target.dataset.id == 1 && !this.data.hasUserInfo) {
            wx.showToast({
                title: '请先授权登录',
                icon: 'none',
                duration: 1500
            })
        } else {
            wx.navigateTo({
                url: e.target.dataset.url,
            })
        }
    }
})