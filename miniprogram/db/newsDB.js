const cloudDB = require("../promise/wxCloudDB.js")
const util = require('../utils/util.js')

/**
 * 获取新闻的具体信息
 * @param {*} id 新闻ID
 */
function getNewsDetail(id){
    return new Promise(function(resolve, reject){
        cloudDB.GetWxCloudDB('weNjtech-jwcNotice', {
            _id: id
        }).then(res => {
            // 有数据
            res.data[0].content = util.formatRichText(res.data[0].content)
            resolve(res.data[0])
        }, res=>{
            // 数据为空
            reject(err)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    getNewsDetail
}