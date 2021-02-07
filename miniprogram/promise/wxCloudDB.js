// miniprogram/promise/wxCloudDB.js
// Package all wx Database function into Promise Object

const Promise = require('es6-promise.min.js')

/**
 * call GET functions of Wechat Cloud Database
 * @param {string} collectionName cloud database collection's name
 * @param {object[]} whereData cloud database where rules
 * @return {Promise}
 */
function GetWxCloudDB(collectionName, whereData) {
	const db = wx.cloud.database()
	const _ = db.command
	//return Promise Object
	return new Promise(function (resolve, resolve2, reject) {
		db.collection(collectionName)
			.where(whereData)
			.get({
				success: res => {
					if (res.data.length != 0) {
						console.log('[云数据库] [GET] [' + collectionName + '] success: ', res.data)
						resolve(res)
					} else if (res.data.length == 0) {
						console.log('[云数据库] [GET] [' + collectionName + '] success: NULL')
						resolve2(res)
					}
				},
				fail: err => {
					console.error('[云数据库] [GET] [' + collectionName + '] fail: ', err)
					reject(err)
				}
			})
	});
}

/**
 * call ADD functions of Wechat Cloud Database
 * @param {string} collectionName Cloud database collection's name
 * @param {object[]} data data for Adding to Cloud Database
 * @return {Promise}
 */
function AddWxCloudDB(collectionName, data) {
	const db = wx.cloud.database()
	const _ = db.command
	//return Promise Object
	return new Promise(function (resolve, reject) {
		db.collection(collectionName)
			.add({
				data: data,
				success: res => {
					console.log('[云数据库] [ADD] [' + collectionName + '] success: ', res)
					resolve(res)
				},
				fail: err => {
					console.error('[云数据库] [ADD] [' + collectionName + '] fail: ', err)
					reject(err)
				}
			})
	});
}

/**
 * call UPDATE functions of Wechat Cloud Database
 * @param {string} collectionName Cloud database collection's name
 * @param {string} tableId user table's id
 * @param {object[]} data data for updating to Cloud Database
 * @param {string} remark remark for definiting the function
 * @return {Promise}
 */
function UpdateWxCloudDB(collectionName, tableId, data, remark) {
	const db = wx.cloud.database()
	const _ = db.command
	//return Promise Object
	return new Promise(function (resolve, reject) {
		db.collection(collectionName)
			.doc(tableId)
			.update({
				data: data,
				success: res => {
					console.log('[云数据库] [UPDATE] [' + collectionName + '] [' + remark + '] success: ', res)
					resolve(res)
				},
				fail: err => {
					console.error('[云数据库] [UPDATE] [' + collectionName + '] [' + remark + '] fail: ', err)
					reject(err)
				}
			})
	});
}

module.exports = {
	GetWxCloudDB: GetWxCloudDB,
	AddWxCloudDB: AddWxCloudDB,
	UpdateWxCloudDB: UpdateWxCloudDB
}