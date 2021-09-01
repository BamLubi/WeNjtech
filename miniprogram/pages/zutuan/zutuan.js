// pages/zutuan/zutuan.js
const {
  getZutuanList,
  getMyZutuanList
} = require("../../db/zutuanDB.js");
const API = require("../../promise/wxAPI.js");
const cloudDB = require("../../promise/wxCloudDB.js");
const {
  date2YMD
} = require("../../utils/dateControl.js");
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    typeOptions: [{
        text: "全部",
        value: 0
      },
      {
        text: "拼车",
        value: 1
      },
      {
        text: "竞赛",
        value: 2
      },
      {
        text: "吃喝玩乐",
        value: 3
      },
      {
        text: "其他",
        value: 4
      },
    ],
    sortOptions: [{
        text: "默认排序",
        value: 0
      },
      {
        text: "人数排序",
        value: 1
      },
    ],
    selectType: 0,
    selectSort: 0,
    activeTab: 0,
    zutuanList: [],
    hasMore: true,
    isLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 页面显示时刷新数据
   */
  onShow: function () {
    // 重置所有数据
    this.setData({
      zutuanList: [],
      hasMore: true
    })
    // 根据所在标签页刷新数据
    if (this.data.activeTab == 0) {
      this.getZutuanList()
    } else {
      this.getMyZutuanList()
    }
  },

  /**
   * 转发
   */
  onShareAppMessage() {
    return {
      title: '校园组团',
      path: '/pages/zutuan/zutuan',
    }
  },

  onReachBottom: function () {
    // 节流
    if (!this.data.isLoading && this.data.hasMore) {
      // 根据所在标签页刷新数据
      if (this.data.activeTab == 0) {
        this.getZutuanList()
      } else {
        this.getMyZutuanList()
      }
    }
  },

  /**
   * 获取所有人组团信息
   */
  getZutuanList: function () {
    let that = this
    // 设置加载中
    this.setData({
      isLoading: true
    })
    // 设置类型
    let type = []
    if (this.data.selectType == 0) {
      this.data.typeOptions.filter(function (x) {
        type.push(x.text)
      })
    } else {
      type.push(this.data.typeOptions[this.data.selectType].text)
    }
    // 设置排序规则
    let sort = null
    if (this.data.selectSort == 0) {
      sort = 'updateTime'
    } else {
      sort = 'num'
    }
    // 发起请求
    getZutuanList(type, sort, this.data.zutuanList.length, 10).then(res => {
      let _list = that.data.zutuanList.concat(res)
      if (res.length < 10) {
        that.setData({
          hasMore: false
        })
      }
      that.setData({
        isLoading: false,
        zutuanList: _list
      })
    }).catch(err => {
      that.setData({
        isLoading: false
      })
      API.ShowToast('失败', 'error')
      console.log(err)
    })
  },

  /**
   * 获取我的组团信息
   */
  getMyZutuanList: function () {
    let that = this
    // 设置加载中
    this.setData({
      isLoading: true
    })
    // 发起请求
    getMyZutuanList(app.globalData.openid, this.data.zutuanList.length, 10).then(res => {
      let _list = that.data.zutuanList.concat(res)
      if (res.length < 10) {
        that.setData({
          hasMore: false
        })
      }
      that.setData({
        isLoading: false,
        zutuanList: _list
      })
    }).catch(err => {
      that.setData({
        isLoading: false
      })
      API.ShowToast('失败', 'error')
      console.log(err)
    })
  },

  /**
   * 切换标签页
   * @param {*} e
   */
  tabChange: function (e) {
    // 如果在校园发布页则强制关闭下拉菜单
    if (this.data.activeTab == 0) {
      this.selectComponent('#dropdownitem_1').toggle(false);
      this.selectComponent('#dropdownitem_2').toggle(false);
    }
    // 刷新数据
    this.setData({
      activeTab: e.detail.name,
      zutuanList: [],
      hasMore: true
    });
    // 加载数据
    this.getMyZutuanList()
  },

  /**
   * 切换类型
   * @param {*} e 
   */
  typeChange: function (e) {
    // 节流
    if (e.detail != this.data.selectType) {
      this.setData({
        selectType: e.detail,
        zutuanList: [],
        hasMore: true
      })
      // 加载数据
      this.getZutuanList()
    } else {
      return
    }
  },

  /**
   * 切换排序方式
   * @param {*} e 
   */
  sortChange: function (e) {
    // 节流
    if (e.detail != this.data.selectSort) {
      this.setData({
        selectSort: e.detail,
        zutuanList: [],
        hasMore: true
      })
      // 加载数据
      this.getZutuanList()
    } else {
      return
    }
  },

  /**
   * 发布新的组团信息
   */
  publish: function () {
    wx.navigateTo({
      url: "/pages/zutuanDetail/zutuanDetail",
    });
  },

  /**
   * 删除组团信息
   * @param {} e 
   */
  delete: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    API.ShowModal('确认删除', '确认要删除此次组团信息吗？删除后不可还原!').then(() => {
      wx.showLoading({
        title: '删除中',
      })
      cloudDB.DeleteWxCloudDB('weNjtech-zutuan', {
        _id: id
      }, '删除组团信息').then(() => {
        return wx.hideLoading()
      }).then(() => {
        return API.ShowToast('删除成功', 'success')
      }).then(() => {
        // 重置数据
        that.setData({
          zutuanList: [],
          hasMore: true
        })
        // 刷新页面
        that.getMyZutuanList()
      }).catch(err => {
        console.log(err);
        wx.hideLoading().then(() => {
          API.ShowToast('删除失败', 'error')
        })
      })
    })
  },

  /**
   * 修改组团信息
   * @param {*} e 
   */
  modify: function (e) {
    let index = e.currentTarget.dataset.index
    let data = this.data.zutuanList[index]
    // 携带参数跳转页面
    wx.navigateTo({
      url: "/pages/zutuanDetail/zutuanDetail?data=" + JSON.stringify(data)
    })
  },

  /**
   * 将联系电话拷贝到剪贴板
   * @param {*} e 
   */
  copyToClipboard: function (e) {
    wx.setClipboardData({
      //准备复制的数据
      data: e.currentTarget.dataset.data,
      success: function (res) {
        console.log("[剪切板] " + stringForCopy);
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  }
});