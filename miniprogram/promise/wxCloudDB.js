// miniprogram/promise/wxCloudDB.js
// Package all wx Database function into Promise Object

const Promise = require("es6-promise.min.js");

/**
 * call GET functions of Wechat Cloud Database
 * @param {string} collectionName cloud database collection's name
 * @param {object[]} whereData cloud database where rules
 * @return {promise}
 */
function GetWxCloudDB(collectionName, whereData) {
	const db = wx.cloud.database();
	const _ = db.command;
	//return Promise Object
	return new Promise(function (resolve, resolve2, reject) {
		db.collection(collectionName)
			.where(whereData)
			.get({
				success: res => {
					if (res.data.length != 0) {
						console.log(`[云数据库] [GET] [${collectionName}] success: `, res.data);
						resolve(res);
					} else if (res.data.length == 0) {
						console.log(`[云数据库] [GET] [${collectionName}] success: NULL`);
						resolve2(res);
					}
				},
				fail: err => {
					console.error(`[云数据库] [GET] [${collectionName}] fail: `, err);
					reject(err);
				},
			});
	});
}

/**
 * call ADD functions of Wechat Cloud Database
 * @param {string} collectionName Cloud database collection's name
 * @param {object[]} data data for Adding to Cloud Database
 * @return {promise}
 */
function AddWxCloudDB(collectionName, data) {
	const db = wx.cloud.database();
	const _ = db.command;
	//return Promise Object
	return new Promise(function (resolve, reject) {
		db.collection(collectionName).add({
			data: data,
			success: res => {
				console.log(`[云数据库] [ADD] [${collectionName}] success: `, res);
				resolve(res);
			},
			fail: err => {
				console.error(`[云数据库] [ADD] [${collectionName}] fail: `, err);
				reject(err);
			},
		});
	});
}

/**
 * call UPDATE functions of Wechat Cloud Database
 * @param {string} collectionName Cloud database collection's name
 * @param {string} tableId user table's id
 * @param {object[]} data data for updating to Cloud Database
 * @param {string} remark remark for definiting the function
 * @return {promise}
 */
function UpdateWxCloudDB(collectionName, tableId, data, remark = '') {
	const db = wx.cloud.database();
	const _ = db.command;
	//return Promise Object
	return new Promise(function (resolve, reject) {
		db.collection(collectionName)
			.doc(tableId)
			.update({
				data: data,
				success: res => {
					console.log(`[云数据库] [UPDATE] [${collectionName}] [${remark}] success: `, res);
					resolve(res);
				},
				fail: err => {
					console.error(`[云数据库] [UPDATE] [${collectionName}] [${remark}] fail: `, err);
					reject(err);
				}
			});
	});
}

/**
 * call WATCH functions of Wechat Cloud Database
 * @param {string} collectionName Cloud database collection's name
 * @param {object[]} whereData cloud database where rules
 * @param {string} remark remark for definiting the function
 * @return {promise}
 */
function DeleteWxCloudDB(collectionName, whereData, remark = '') {
	const db = wx.cloud.database();
	const _ = db.command;
	//return Promise Object
	return new Promise(function (resolve, reject) {
		db.collection(collectionName)
			.where(whereData)
			.remove({
				success: res => {
					console.log(`[云数据库] [DELETE] [${collectionName}] [${remark}] success: `, res);
					resolve(res);
				},
				fail: err => {
					console.error(`[云数据库] [DELETE] [${collectionName}] [${remark}] fail: `, err);
					reject(err);
				}
			});
	});
}

/**
 * call COUNT functions of Wechat Cloud Database
 * @param {string} collectionName Cloud database collection's name
 * @param {object[]} whereData cloud database where rules
 * @param {string} remark remark for definiting the function
 * @return {promise}
 */
function CountWxCloudDB(collectionName, whereData, remark = '') {
	const db = wx.cloud.database();
	const _ = db.command;
	//return Promise Object
	return new Promise(function (resolve, reject) {
		db.collection(collectionName)
			.where(whereData)
			.count({
				success: res => {
					console.log(`[云数据库] [COUNT] [${collectionName}] [${remark}] success: `, res.total);
					resolve(res.total);
				},
				fail: err => {
					console.error(`[云数据库] [COUNT] [${collectionName}] [${remark}] fail: `, err);
					reject(err);
				}
			});
	});
}

/**
 * call WATCH functions of Wechat Cloud Database
 * @param {string} collectionName Cloud database collection's name
 * @param {object[]} whereData cloud database where rules
 * @param {string} remark remark for definiting the function
 * @return {promise}
 */
function WatchWxCloudDB(collectionName, whereData, remark = '') {
	const db = wx.cloud.database();
	const _ = db.command;
	//return Promise Object
	return new Promise(function (resolve, reject) {
		db.collection(collectionName)
			.where(whereData)
			.watch({
				onChange: res => {
					console.log(`[云数据库] [WATCH] [${collectionName}] [${remark}] success: `, res);
					resolve(res);
				},
				onError: err => {
					console.error(`[云数据库] [WATCH] [${collectionName}] [${remark}] fail: `, err);
					reject(err);
				}
			});
	});
}

module.exports = {
	GetWxCloudDB: GetWxCloudDB,
	AddWxCloudDB: AddWxCloudDB,
	UpdateWxCloudDB: UpdateWxCloudDB,
	CountWxCloudDB: CountWxCloudDB,
	WatchWxCloudDB: WatchWxCloudDB,
	DeleteWxCloudDB: DeleteWxCloudDB
};