/* dateControl.js 用于存储日期转换的函数 */

/**
 * 将数字转换为星期
 * @param {number} week [0,1,2,4,5,6]
 * @return {string} 星期["一","二","三","四","五","六","日"]
 */
function transToWeek(week) {
    switch (week) {
        case 1:
            return "星期一";
        case 2:
            return "星期二";
        case 3:
            return "星期三";
        case 4:
            return "星期四";
        case 5:
            return "星期五";
        case 6:
            return "星期六";
        case 0:
            return "星期日";
    }
}

/**
 * 加减天数
 * @param {string} date 基础日期"yyyy-mm-dd"
 * @param {string} method '+' || '-'
 * @param {number} days 天数
 * @return {Date} 运算后的日期
 */
function mathChangeDate(date, method, days) {
    //ios不解析带'-'的日期格式，要转成'/'，不然Nan，切记
    let dateVal = date.replace(/-/g, '/');
    let timestamp = Date.parse(dateVal);
    if (method == '+') {
        timestamp = timestamp / 1000 + 24 * 60 * 60 * days;
    } else if (method == '-') {
        timestamp = timestamp / 1000 - 24 * 60 * 60 * days;
    }
    return toDate(timestamp);
}

/**
 * 天数转换成date
 * @param {number} days 天数
 * @return {string} "yyyy-mm-dd"
 */
function toDate(days) {
    let date = new Date(parseInt(days) * 1000);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    let day = date.getDate();
    day = day < 10 ? ('0' + day) : day;
    return year + '-' + month + '-' + day;
}

/**
 * 判断是今天/明天/日期
 * @param {Date} selectDate 
 * @param {Date} todayDate 
 * @return {string} ["今天","明天","星期几"]
 */
function isTodayORTomorrow(selectDate, todayDate) {
    // 判断日期
    if (selectDate.year == todayDate.year && selectDate.month == todayDate.month && selectDate.day == todayDate.day) {
        return "今天";
    }
    let tomorrowString = todayDate.year + '-' + todayDate.month + '-' + todayDate.day
    let tomorrow = mathChangeDate(tomorrowString, '+', 1).split('-')
    if (selectDate.year == tomorrow[0] && selectDate.month == tomorrow[1] && selectDate.day == tomorrow[2]) {
        // 明天
        return "明天";
    } else {
        // 显示星期
        return transToWeek(selectDate.week);
    }
}

/**
 * Date转换成YYYY-MM-DD
 * @param {*} date Date
 * @return {string} "YYYY-MM-DD"
 */
function date2YMD(date) {
    try {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        month = month < 10 ? ('0' + month) : month;
        let day = date.getDate();
        day = day < 10 ? ('0' + day) : day;
        return year + '-' + month + '-' + day;
    } catch (e) {
        return '2021-01-01'
    }
}

module.exports = {
    mathChangeDate: mathChangeDate, // 加减天数
    isTodayORTomorrow: isTodayORTomorrow, // 判断今天、明天
    date2YMD: date2YMD,
}