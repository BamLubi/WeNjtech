// miniprogram/mePackage/pages/info/info.js
const app = getApp()
const cloudDB = require("../../../promise/wxCloudDB.js")
const API = require("../../../promise/wxAPI.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: '',
    stuNum: '',
    canEditStuNum: false,
    leftDay: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断是否可以修改学号
    let nowDate = new Date()
    let cloudDate = new Date(app.globalData.localUserInfo.setStuNumDate)
    let leftDay = (nowDate - cloudDate) / (24 * 60 * 60 * 1000)
    leftDay = 90 - parseInt(leftDay)
    if(leftDay <= 0){
      this.setData({
        canEditStuNum: true
      })
    }
    this.setData({
      leftDay: leftDay,
      avatarUrl: app.globalData.localUserInfo.avatarUrl,
      nickName: app.globalData.localUserInfo.nickName,
      stuNum: app.globalData.localUserInfo.stuNum
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
    this.onLoad()
    setTimeout(function(){
      wx.stopPullDownRefresh()
    },1500)
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
   * 学号输入框监听
   */
  getStuNum: function (e) {
    this.setData({
      stuNum: e.detail.value
    })
  },

  submit: function () {
    let that = this
    var collectionName = "miniNjtech-userInfo"
    API._hideKeyBoard().then(res => {
      return API.ShowModal('', "请确保您使用了您自己的\n学号(" + that.data.stuNum + ")\n每90天仅可修改一次!", true, '我再想想', '我确定了')
    }).then(res => {
      wx.showLoading({title: '提交中'})
      return cloudDB.GetWxCloudDB(collectionName, {_openid: app.globalData.options})
    }).then(res => {
      let nowDate = new Date()
      return cloudDB.UpdateWxCloudDB(collectionName, res.data[0]._id, {stuNum: that.data.stuNum, setStuNumDate: nowDate}, '更新学号')
    }).then(res => {
      wx.hideLoading()
      wx.showToast({title: '设置成功'})
      that.setData({
        canEditStuNum: false,
        leftDay: 90
      })
    })
  },

  edit: function () {

  }
})