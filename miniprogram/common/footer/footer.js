// common/footer/footer.js
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持 
    },
    /**
     * 组件的属性列表
     */
    properties: {
        version: {
            type: String,
            value: "v0.0.0"
        }
    },

    /**
     * 组件的初始数据,私有
     */
    data: {
        author: "小陆斑比"
    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})