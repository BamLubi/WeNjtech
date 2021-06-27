<?php
/*
 * @Description: 
 * @Version: 1.0
 * @Autor: Lyy
 * @Date: 2020-04-24 17:37:12
 * @LastEditors: Lyy
 * @LastEditTime: 2020-04-29 23:06:15
 */
require __DIR__ . '/vendor/autoload.php';
use Goutte\Client;


class Njtech {
    private $login_configs;
    private $browser;
    private $isOnline;
    private $login_retry_times;
    
    private $login_entrance = 'https://i.njtech.edu.cn';
    private $jwb = 'http://jwb.njtech.edu.cn';
    private $auz_entrance = 'https://jwgl.njtech.edu.cn/sso/ktiotlogin';
    private $jwglReal = 'https://jwgl.njtech.edu.cn';
    
    // 初始化登陆
    public function __construct($login_configs) {
        // class只负责保存登录信息
        $this->login_configs = $login_configs;
        $this->isOnline = false;
        $login_retry_times = 0;
        // 初始化浏览器
        $this->browser = new Client();
        // 如果未登录，则登陆
        if ($this->isOnline == false){
            $this->login();
        }
    }
    
    private function packMsg($statusCode = false, $message = '') {
        return json_encode([
            'statusCode' => $statusCode,
            'message' => $message,
        ], JSON_UNESCAPED_UNICODE);
    }
    
    private function loginCheck() {
        if ($this->isOnline) return true;
        else return false;
    }
    
    // 登录
    private function login() {
        // 登录环境初始化
        $configs = $this->login_configs;
        $browser = $this->browser;
        $url = $this->login_entrance;
        
        try {
            // 执行登录
            $crawler = $browser->request('GET', $url);
            $form = $crawler->selectButton('login')->form();
            $form['username'] = $configs['username'];
            $form['password'] = $configs['password'];
            $crawler = $browser->submit($form)
            ->filter('#msg')
            ->text();
            
            // 找到了#msg说明还在登录页面, 登录失败
            if ($this->login_retry_times < 2){
                $this->login_retry_times ++;
                return $this->login();
            }else {
                $this->login_retry_times = 0;
                return $this->packMsg(false, '登录失败');
            }
        } catch (Exception $e) {
            // 没找到, 会抛出异常, 说明登录成功
            $this->isOnline = true;
            return $this->packMsg(true, '登陆成功');
            // $profile = $entrance.'/app/profile/data?accountKey=XH&accountValue='.$configs['username'].'&uri=open_api/customization/bxsjbxx/list';
            // $crawler = $browser->request('GET', $profile);
            // $response = $browser->getResponse()->getContent();
            // return $this->packMsg(true, json_decode($response));
        }
    }
    
    // 空教室
    public function empty_classes($query_config) {
        // 登录检查，若登陆跳出，则重新登陆
        if(!$this->loginCheck()){
            $res = $this->login();
            if(!json_decode($res)->statusCode){
                return $res;
            }
        }
        
        // 教务管理环境初始化
        $browser = $this->browser;
        $url = $this->jwglReal.'/cdjy/cdjy_cxKxcdlb.html?doType=query&gnmkdm=N2155';
        
        try {
            // 教务管理系统认证
            $crawler = $browser->request('GET', $this->auz_entrance)->html();
            // ->filter('.badge')->html();
            // return $this->packMsg(false, $crawler);

            // 表单信息
            $formData = [
                'fwzt' => 'cx',
                'xqh_id' => 1,
                'xnm' => $query_config['year'],
                'xqm' => $query_config['term'],
                'jyfs' => 0,
                'zcd' => $query_config['term_week'],
                'xqj' => $query_config['week'],
                'jcd' => $query_config['time'],
                'queryModel.showCount' => 1,
                'queryModel.currentPage' => 1
            ];
            
            // 请求空教室信息
            // 1. 获取空教室的总量
            $crawler = $browser->request('POST', $url, $formData);
            $response = $browser->getResponse()->getContent();
            $response = json_decode($response);
            $totalCount = $response->totalCount;
            $totalCount = ( is_numeric($totalCount) && $totalCount>0 ) ? $totalCount : 15 ;
            // $totalCount = 5; // 测试用，限制数量为5个
            $formData["queryModel.showCount"] = $totalCount;
            // 2. 获取全部数据
            $crawler = $browser->request('POST', $url, $formData);
            $response = $browser->getResponse()->getContent();
            return json_decode($response);
            // return $this->packMsg(true, json_decode($response));
        } catch(Exception $e) {
            // echo "异常:".$e;
            return $this->packMsg(false, '接口需要更新, 请联系开发者维护接口');
        }
    }
}
?>