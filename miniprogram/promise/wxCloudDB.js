// miniprogram/promise/wxCloudDB.js
// Package all wx Database function into Promise Object

const Promise = require('es6-promise.min.js')

/**
 * call GET functions of Wechat Cloud Database
 * 
 * @collectionName cloud database collection's name
 * @whereData cloud database where rules
 * @return Promise Object
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
 * 
 * @collectionName Cloud database collection's name
 * @data data for Adding to Cloud Database
 * @return Promise Object
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
 * 
 * @collectionName Cloud database collection's name
 * @tableId user table's id
 * @data data for updating to Cloud Database
 * @remark remark for definiting the function
 * @return Promise Object
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