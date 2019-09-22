//app.js
App({
	globalData: {
		systemInfo: null
	},
    onLaunch: function() {
		var that = this
		// 初始化云开发环境
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                env: 'lyy1-2mnm7',
                traceUser: true
            })
        }
		// 获取手机信息
		wx.getSystemInfo({
			success: function (res) {
				that.globalData.systemInfo = res
				wx.setStorageSync('systemInfo', res)
			}
		})
    }
})