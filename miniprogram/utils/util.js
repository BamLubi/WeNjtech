/**
 * 格式化时间输出格式：YYYY-MM-DD HH-MM-SS
 * @param {Date} date 
 */
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

/**
 * 补齐数字为2位
 * @param {number} n
 * @return {string}
 */
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/**
 * 生成16位UUID
 * @return {string}
 */
function makeUUID() {
    let a, b, c;
    [a, b, c] = [a, b, c].map(() => {
        return Math.floor(Math.random() * 10);
    })
    const time = new Date().getTime();
    return '' + a + time + b + c;
}

/**
 * 特殊字符替换
 * @param {*} src 
 */
function checkIllegalText(src) {
    return src.replace(new RegExp("[\\/, \\\\, \\<, \\>, \\`]|script|view|text|input|block|form|textarea|button|!--|-->|map", "gm"), "")
}

module.exports = {
    formatTime: formatTime,
    makeUUID: makeUUID,
    checkIllegalText: checkIllegalText
}