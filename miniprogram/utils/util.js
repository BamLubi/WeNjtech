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

// 格式化富文本
function formatRichText(html) {
    let newContent = html.replace(/<img[^>]*>/gi, function (match, capture) {
        match = match.replace(/style="[^"]+"/gi, '').replace(/style='[^']+'/gi, '');
        match = match.replace(/width="[^"]+"/gi, '').replace(/width='[^']+'/gi, '');
        match = match.replace(/height="[^"]+"/gi, '').replace(/height='[^']+'/gi, '');
        return match;
    });
    newContent = newContent.replace(/style="[^"]+"/gi, function (match, capture) {
        match = match.replace(/width:[^;]+;/gi, 'max-width:100%;').replace(/width:[^;]+;/gi, 'max-width:100%;');
        return match;
    });
    newContent = newContent.replace(/width="[^"]+"/gi, function (match, capture) {
        match = match.replace(/width="[^"]+"/gi, 'width="100%"');
        return match;
    });
    // 对text-indent大于100的span标签进行格式化（改为右对齐）
    newContent = newContent.replace(/<p[^>]*>/gi, function (match) {
        match = match.replace(/style="[^=>]*"/g, function (match) {
            match = match.replace(/text-indent:[^=>]*;/g, function (match) {
                if (Number(match.substring(12, match.length - 3)) > 100) {
                    return "text-align:right;"
                } else {
                    return match
                }
            })
            return match
        })
        return match
    })
    // 格式化span标签（允许span换行）
    newContent = newContent.replace(/<span[^>]*>/gi, function (match) {
        match = match.replace(/style="[^=>]*"/g, function (match) {
            return match.substring(0, match.length - 1) + ";overflow-wrap: break-word;\""
        })
        return match
    })
    //格式化img（将img链接补全）
    if (newContent.indexOf('img') != -1) { //判断img是否存在
        newContent = newContent.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
            return '<img src=' + "http://jwc.njtech.edu.cn" + capture + ' style="max-width:100%;height:auto;display:block;margin:10px 0;"/>';
        });
    }
    return newContent;
}

module.exports = {
    formatTime: formatTime,
    makeUUID: makeUUID,
    checkIllegalText: checkIllegalText,
    formatRichText: formatRichText
}