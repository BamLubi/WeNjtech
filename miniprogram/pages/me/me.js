// miniprogram/pages/me/me.js
const app = getApp()
const API = require("../../promise/wxAPI.js")
const userInfoDB = require("../../db/userInfoDB.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        localUserInfo: null,
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
        let that = this
        // 根据云端是否有记录来决定要不要获取用户头像昵称
        // 判断获取个人信息
        if (app.globalData.hasUserInfo == true) {
            that.data.localUserInfo = app.globalData.localUserInfo
            that.data.openid = app.globalData.openid
            that.setData({
                hasUserInfo: true,
            })
        } else if (app.globalData.hasUserInfo == null) {
            // 异步操作
            app.userInfoReadyCallback = res => {
                that.data.localUserInfo = app.globalData.localUserInfo
                that.data.openid = app.globalData.openid
                that.setData({
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
     * 获取用户个人信息,
     */
    getUserInfo: function () {
        let that = this
        // 显示loading
        wx.showLoading({
            title: '获取中'
        })
        API.GetUserProfile().then(res => userInfoDB.UploadUserInfo(res)).then(res => {
            app.globalData.cloudUserInfo = JSON.parse(JSON.stringify(res))
            app.globalData.localUserInfo = JSON.parse(JSON.stringify(res))
            app.globalData.hasUserInfo = true
            that.data.localUserInfo = app.globalData.localUserInfo
            that.data.openid = app.globalData.openid
            that.setData({
                hasUserInfo: true,
            })
            // 回调广播函数
            if (app.userInfoReadyCallback) {
                app.userInfoReadyCallback()
            }
            // 显示成功样式
            wx.hideLoading().then(()=>{
                API.ShowToast('获取成功', 'success')
            })
        }).catch(err=>{
            console.log("获取个人信息失败",err);
            wx.hideLoading().then(()=>{
                API.ShowToast('获取失败', 'error')
            })
        })
    },

    /**
     * 跳转页面
     */
    navigatePage: function (e) {
        console.log("[me] [跳转页面]", e.target.dataset.url)
        // 跳转编辑资料页面需保证全局有用户信息
        if (e.target.dataset.id == 1 && !this.data.hasUserInfo) {
            wx.showToast({
                title: '请先点击获取头像昵称',
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