// component/busCard/busCard.js
const API = require("../../promise/wxAPI.js")
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        info: {
            type: Object,
            value: {}
        },
        line: {
            type: String,
            value: ''
        },
        site: {
            type: Array,
            value: []
        },
        showLeftTime: {
            type: Number,
            value: 1
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        leftTimeString: ''
    },
    /**
     * 组件被加载入树
     */
    attached: function () {
        // 车辆时间,是一个number
        var startTime = this.data.info.startTime.split(":")
        startTime = {
            "hour": parseInt(startTime[0]),
            "minute": parseInt(startTime[1])
        }
        // 对第一个班车，生成倒计时
        if (this.data.showLeftTime == 1) {
            // 当前时间
            var nowDate = new Date()
            nowDate = {
                "hour": parseInt(nowDate.getHours()),
                "minute": parseInt(nowDate.getMinutes())
            }
            // 计算差值
            var res = (startTime.hour - nowDate.hour) * 60 + startTime.minute - nowDate.minute
            if (res == 0) {
                this.setData({
                    leftTimeString: "即将发车"
                })
            } else if (res < 0) {
                this.setData({
                    leftTimeString: "已发车"
                })
            } else {
                this.setData({
                    leftTimeString: res + "分钟"
                })
            }
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        setNotice: function () {
            var that = this
            API.ShowModal("设置乘车提醒", "发车前10分钟将通过微信提醒您乘车!\n烦请您观看6~15s的广告。\n您的支持是对我们最大的鼓励\n（*＾-＾*）", true, "残忍拒绝", "前往支持").then(function () {
                // 用户确认
                that.triggerEvent("confirmSetNotice")
            }, function () {
                // 用户取消
            })
        }
    }
})