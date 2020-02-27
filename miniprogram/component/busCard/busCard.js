// component/busCard/busCard.js
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
    attached: function(){
        // 车辆时间,是一个number
        var startTime = this.data.info.startTime
        startTime = {
            "hour": parseInt(startTime.toFixed(0)),
            "minute": parseInt(((startTime*100)%100).toFixed(0))
        }
        var endTime = this.data.info.endTime
        endTime = {
            "hour": parseInt(endTime.toFixed(0)),
            "minute": parseInt(((endTime*100)%100).toFixed(0))
        }
        // 生成倒计时
        if (this.data.showLeftTime == 1) {
            // 当前时间
            var nowDate = new Date()
            nowDate = {
                "hour": parseInt(nowDate.getHours()),
                "minute": parseInt(nowDate.getMinutes())
            }
            // 计算差值
            var res = (startTime.hour - nowDate.hour)*60 + startTime.minute - nowDate.minute
            if (res == 0) 
                this.setData({
                    leftTimeString: "即将发车"
                })
            else if (res < 0) 
                this.setData({
                    leftTimeString: "已发车"
                })
            else this.setData({
                    leftTimeString: res + "分钟"
                })  
        }
        // 格式化所有时间，放在一行有问题？？？
        let tmp_startTime = startTime.hour + ":"
        tmp_startTime += 
            startTime.minute==0?"00":startTime.minute<10?"0"+startTime.minute:startTime.minute
        let tmp_endTime = endTime.hour + ":"
        tmp_endTime +=
            endTime.minute==0?"00":endTime.minute<10?"0"+endTime.minute:endTime.minute
        this.setData({
            ["info.startTime"]: tmp_startTime,
            ["info.endTime"]: tmp_endTime
        })
    },
    /**
     * 组件的方法列表
     */
    methods: {

    }
})