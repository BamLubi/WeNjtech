// miniprogram/pages/index/index.js
const cloudFun = require("../../promise/wxCloudFun.js")
const cloudDB = require("../../promise/wxCloudDB.js")
const cloudStore = require("../../promise/wxCloudStore.js")
const API = require("../../promise/wxAPI.js")
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardCur: 0,
        services: [{
            id: 0,
            name: '校园生活',
            children: [{
                id: 0,
                name: "班车时刻",
                img: "/images/index/banche.png",
                url: "/pages/schoolBus/schoolBus",
                type: 'page'
            }, {
                id: 1,
                name: "去哪学习",
                img: "/images/index/jiaoshi.png",
                url: "/pages/classroom/classroom",
                type: 'page'
            }, {
                id: 2,
                name: "校园Q&A",
                img: "/images/index/QA.png",
                url: "/pages/campusQ&A/campusQ&A",
                type: 'page'
            }, {
                id: 3,
                name: "我的课表",
                img: "/images/index/kebiao.png",
                url: "/pages/kebiao/kebiao",
                type: 'page'
            }, {
                id: 4,
                name: "校园组团",
                img: "/images/index/un_zutuan.png",
                url: "",
                type: 'page'
            }, {
                id: 5,
                name: "校园闲置",
                img: "/images/index/un_ershou.png",
                url: "",
                type: 'page'
            }, {
                id: 6,
                name: "猫猫狗狗",
                img: "/images/index/un_pets.png",
                url: "",
                type: 'page'
            }, {
                id: 7,
                name: "校园通知",
                img: "/images/index/notice.png",
                url: "/",
                type: 'naviToMini',
                data: {
                    appId: 'wx5bbb6643aaa3d79a',
                    envVersion: 'release',
                    shortLink: ""
                }
            }]
        }, {
            id: 1,
            name: '疫情服务',
            children: [{
                id: 0,
                name: '核酸检测结果',
                img: '/images/index/hesuan.png',
                src: '/',
                type: 'naviToMini',
                data: {
                    appId: 'wx2eec5fb00157a603',
                    envVersion: 'release',
                    shortLink: "#小程序://国家政务服务平台/核酸和抗体检测结果查询/UKhozm70xQjKBRa"
                }
            }, {
                id: 1,
                name: '通信行程卡',
                img: '/images/index/xingcheng.png',
                src: '/',
                type: 'naviToMini',
                data: {
                    appId: 'wx8f446acf8c4a85f5',
                    envVersion: 'release',
                    shortLink: ''
                }
            },{
                id: 2,
                name: '疫情地图',
                img: '/images/index/map.png',
                src: '/',
                type: 'naviToMini',
                data: {
                    appId: 'wxccb972bedb041af4',
                    envVersion: 'release',
                    shortLink: ''
                }
            }]
        }],
        dict: {},
        isNotice: true, // 是否显示公告栏
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        // 云端获取dict
        cloudDB.GetWxCloudDB("weNjtech-publicDict", {
            name: "miniNjtechDict"
        }).then(res => {
            that.setData({
                dict: res.data[0]
            })
            if(that.data.dict.lock){
                that.setData({
                    ["services[0].children[4].url"]: '/pages/zutuan/zutuan',
                    ["services[0].children[4].img"]: '/images/index/zutuan.png'
                })
            }
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    /**
     * 隐藏公告栏
     */
    HideNotice: function () {
        this.setData({
            isNotice: false
        })
    },

    /**
     * 跳转页面
     */
    navigatePage: function (e) {
        // 判断地址是否为空
        if (e.currentTarget.dataset.url != '') {
            if (e.currentTarget.dataset.type == 'page') {
                // 跳转页面
                wx.navigateTo({
                    url: e.currentTarget.dataset.url,
                })
            } else if (e.currentTarget.dataset.type == 'naviToMini') {
                // 跳转小程序
                let data = e.currentTarget.dataset.data
                wx.navigateToMiniProgram({
                    appId: data.appId,
                    envVersion: data.envVersion,
                    shortLink: data.shortLink
                })
            } else {
                wx.switchTab({
                    url: e.currentTarget.dataset.url,
                })
            }
        } else {
            API.ShowToast('正在施工中...', 'none', 2000)
        }
    },
})