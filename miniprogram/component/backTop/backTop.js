// component/backTop/backTop.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
		duration: {
            type: Number,
            value: 1000
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        animationData: null,
        hasAnimationMaking: null
    },

    /**
     * 组件被创建
     */
    created: function() {
        var animation = wx.createAnimation({
            duration: this.properties.duration,
            timingFunction: 'ease'
        })
        this.animation = animation
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 点击
         */
        click: function() {
            if (this.data.hasAnimationMaking != null) {
                return
            }
            this.hide()
            this.triggerEvent("click")
        },
        /**
         * 显示
         */
        show: function() {
			var that = this
			// 如果正在显示，则退出
            if (this.hasAnimationMaking == 'show') return
            this.setData({
                hasAnimationMaking: 'show'
            })
			// 设置动画
            this.animation.opacity(1).step()
            this.setData({
                animationData: this.animation.export()
            })
			// 设置时间
            setTimeout(function() {
                that.setData({
                    hasAnimationMaking: null
                })
			}.bind(this), this.properties.duration)
        },
        /**
         * 隐藏
         */
        hide: function() {
			var that = this
			// 如果正在隐藏，则退出
			if (this.hasAnimationMaking == 'hide') return
            this.setData({
                hasAnimationMaking: 'hide'
            })
			// 设置动画
            this.animation.opacity(0).step()
            this.setData({
                animationData: this.animation.export()
            })
			// 设置时间
            setTimeout(function() {
                that.setData({
                    hasAnimationMaking: null
                })
			}.bind(this), this.properties.duration)
        }
    }
})