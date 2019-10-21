// miniprogram/pages/service/service.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        services: [{
            name: "校车查询",
			color: "orange",
            funs: [{
                id: 1,
                name: "班车时间",
                img: "/images/service/bus.png"
            }, {
                id: 2,
                name: "站点导航",
				img: "/images/service/site.png"
            }]
        }, {
            name: "食堂特色",
			color: "#44cef6",
            funs: [{
				id: 3,
				name: "即将开放",
				img: "/images/service/res.png"
			}]
        }],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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

    clickBtn: function(event) {
        let id = event.currentTarget.dataset.id
        switch (id) {
            case 1:
                wx.navigateTo({
                    url: '/schoolBusPackage/pages/index/index',
                })
        }
    }
})