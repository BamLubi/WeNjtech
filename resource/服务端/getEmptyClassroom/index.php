<?php
/*
 * @Description: 
 * @Version: 1.0
 * @Autor: Lyy
 * @Date: 2020-04-24 17:59:20
 * @LastEditors: Lyy
 * @LastEditTime: 2020-05-04 16:53:42
 */
require_once '../Njtech.php';

// 设置无线运行时间
set_time_limit(0);
// 设置浏览器关闭继续运行
ignore_user_abort(true);
// 设置日志文件
$log = "php.log";
log_file("Starting......");

// 全局配置
$login_username = '**********';// 教务处登陆_用户名
$login_password = '**********';// 教务处登陆_密码
$query_year = 2020;// 查询_学年
$query_term = 3;// 查询_学期 值为3或12;2~7月=>12,9~1月=>3
$query_term_week = 1024;// 查询_周次
$query_week = 1;// 查询_星期
$query_time = 3;// 查询_节次
$empty_classroom_file = 'emptyClass.json';
$cdlb_limit = ['004', '005', '007', '009', '011'];// 指定的场地类别
$time_limit = [3, 12, 48, 192, 768];// 指定的节次，以两节课为一次
$login_config = array('username' => $login_username, 'password' => $login_password);

// 初始化配置信息
$year = intval(date('Y'));
$month = intval(date('m'));
$day = intval(date('d'));
$query_week = intval(date('w')); // 获取星期几，获取结果为[1,2,3,4,5,6,0]需要将周日改为7
if ($query_week == 0) $query_week = 7;
if ($month <=7 && $month >= 2) {
    // 第二学年
    $query_term = 12;
    $query_year = $year - 1;
}else if ($month <=12 && $month >= 8) {
    // 第一学年
    $query_term = 3;
    $query_year = $year;
}else if ($month == 1) {
    // 第一学年
    $query_term = 3;
    $query_year = $year - 1;
}
log_file("学年: " . $query_year);
log_file("学期: " . $query_term);
$day1 = strtotime('2020-8-31'); // 8月31日为第1周，此项为基准周次，最大值为20周
$day2 = strtotime(date('Y-m-d'));
$query_term_week = intval(($day2 - $day1)/(86400*7)) + 1;
if ($query_term_week > 20) $query_term_week = 20;
log_file("周次: " . $query_term_week);
$query_term_week = pow(2, $query_term_week - 1);
log_file("星期: " . $query_week);

$query_config = array('year' => $query_year, 'term' => $query_term, 'term_week' => $query_term_week, 'week' => $query_week, 'time' => $query_time);

// 开始爬取
// 初始化浏览器
log_file("初始化浏览器");
$client = new Njtech($login_config);

// 清空文件
log_file("清空文件......");
clearOutputFile();
log_file("清空文件完成......");

// 查询一日的空教室
foreach($time_limit as $item){
    global $query_config;
    $query_config["time"] = $item;
    log_file($query_config["time"] . "获取中...");
    getOnceClassroom($query_config);
    log_file($query_config["time"] . "获取完成!");
}

// 调用python
log_file("调用Python......");
shell_exec('python3 uploadData.py > /dev/null 2>&1 &'); // 输出到空设备文件
log_file("SUCCESS End");
log_file("");

/**
 * 获取一次空教室
 */
function getOnceClassroom($query_config){
    // 引用全局变量
    global $client;
    // 获取空教室
    $response = array();
    $response = $client->empty_classes($query_config)->items;

    // 循环重构
    foreach ($response as $item) {
        // 排除不需要的教室
        if(!isNeedClassRoom($item)) continue;

        // 构造教室
        $empty_classroom = [
            '_id' => $item->cd_id,
            'cdlb_id' => $item->cdlb_id,
            'lh' => $item->lh,
            'name' => $item->cdmc,
            'emptyTime' => $query_config["time"]
        ];
        // 写入文件
        writeEmptyClassroom($empty_classroom);
        // echo $empty_classroom['name'] . ' 场地类别: ' . $empty_classroom['cdlb_id'] . ' 楼号: ' . $empty_classroom['lh'] . PHP_EOL;
    }
}

/**
 * 空教室写入文件
 */
function writeEmptyClassroom($empty_classroom){
    // 引用全局变量
    global $empty_classroom_file;
    $json_string = json_encode($empty_classroom, JSON_UNESCAPED_UNICODE);
    file_put_contents($empty_classroom_file, $json_string.PHP_EOL, FILE_APPEND | LOCK_EX);
}

/**
 * 清空输出文件
 */
function clearOutputFile(){
    // 引用全局变量
    global $empty_classroom_file;
    file_put_contents($empty_classroom_file, '', LOCK_EX);
}

/**
 * 判断是否是需要的教室
 */
function isNeedClassRoom($classroom){
    // 引用全局变量
    global $cdlb_limit;
    // 没有楼号的排除
    if ( !array_key_exists("lh", $classroom) ) return false;
    // 只选择指定的场地类别
    else if ( !in_array($classroom->cdlb_id, $cdlb_limit) ) return false;
    else return true;
}

/**
 * 输出日志
 */
function log_file($content) {
    global $log;
    error_log("[" . date("Y-m-d H:i:s", time()) . "] " . $content . "\n", 3, $log);
}
?>
