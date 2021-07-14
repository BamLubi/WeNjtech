// pages/kebiao/kebiao.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        current: 24,// 当前swiper被选中的序号，0开始，非显示出来的选中
        select: 1,// 被选中的序号，1开始，显示出来的选中
        week: [{
            id: 1,
            name: "周一"
        },{
            id: 2,
            name: "周二"
        },{
            id: 3,
            name: "周三"
        },{
            id: 4,
            name: "周四"
        },{
            id: 5,
            name: "周五"
        },{
            id: 6,
            name: "周六"
        },{
            id: 7,
            name: "周日"
        }],
        weekSelect: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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

    SwiperChange: function (e) {
        this.setData({
            select: (parseInt(e.detail.current) + 2) % 26 + 1
        })
    },

    /**
     * 选择周数
     */
    SelectWeeks: function(e){
        this.setData({
            current: (e.currentTarget.dataset.id - 3 + 26) % 26,
        })
    },

    /**
     * 选择星期
     */
    SelectWeek: function(e){
        this.setData({
            weekSelect: e.currentTarget.dataset.id
        })
    }
})