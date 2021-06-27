import json
import requests
import re
import datetime
import logging
import subprocess
import time


class EmptyClassroom:
    def __init__(self, init_filename, final_filename):
        self.count = 0  # 计数多个时间段有空的教室
        self.init_empty_classroom_file = init_filename  # 存放php获取的原始数据
        self.final_empty_classroom_file = final_filename  # 存放php获取的原始数据
        self.source_list = []  # 存放处理后的结果数据
        self.cdlb = {
            '004': '阶梯教室',
            '005': '阶梯教室',
            '007': '中教室',
            '009': '小教室',
            '011': '阶梯教室'
        }
        self.all_empty_classroom = 0

    def write_empty_classroom(self):
        """
        空教室写入文件
        :return:
        """
        try:
            with open(self.final_empty_classroom_file, "w", encoding="utf-8") as f:
                for item in self.source_list:
                    f.write(json.dumps(item, ensure_ascii=False) + '\n')
        except IOError:
            logging.error("Write empty-classroom FAILURE!")
            return False
        else:
            logging.info("Write empty-classroom SUCCESS!")
            return True

    def read_empty_classroom(self):
        """
        读取空教室文件
        :return:
        """
        try:
            with open(self.init_empty_classroom_file, 'r', encoding='UTF-8') as f:
                line = f.readline()
                while line:
                    item = json.loads(line)
                    flg = self.is_empty_classroom_exist(item)
                    # 判断是否已经存在
                    if flg != -1:
                        # 教室已经存在，将空时间加上去
                        self.source_list[flg]['emptyTime'] += self.emptytime2list(item['emptyTime'])
                    else:
                        # 教室不存在
                        self.push_empty_classroom(item)
                        self.all_empty_classroom += 1
                        self.count += 1
                    line = f.readline()
        except IOError:
            logging.error("Read origin-file FAILURE!")
            return False
        else:
            logging.info("Deal origin-file SUCCESS!")
            return True

    def push_empty_classroom(self, empty_classroom):
        """
        将空教室插入资源列表
        1. 重新处理楼号、教室名、空闲时间
        :param empty_classroom:
        :return:
        """
        # 1. 正则拆分教室
        pattern = "(.*?)([0-9][0-9][0-9])"
        res = re.compile(pattern).findall(empty_classroom["name"])
        empty_classroom["name"] = res[0][1]  # 修改教室名为门牌号
        empty_classroom["lh"] = res[0][0]  # 修改lh为具体楼
        # 如果教室名称前两位为“笃学”，则改为“浦江”
        empty_classroom["lh"] = empty_classroom["lh"].replace("笃学","浦江")
        # 2. 修改场地类别为具体内容
        empty_classroom["cdlb_id"] = self.cdlb[empty_classroom["cdlb_id"]]
        # 3. 修改空闲时间为列表
        empty_classroom["emptyTime"] = self.emptytime2list(empty_classroom["emptyTime"])
        # 4. 修改楼层为教室名的第一个字段
        empty_classroom["lc"] = int(empty_classroom["name"][0])
        # 5. 写入资源列表
        self.source_list.append(empty_classroom)

    @staticmethod
    def emptytime2list(empty_time):
        """
        将获取的空闲时间转换成列表
        :param empty_time: 空闲时间
        :return:
        """
        if empty_time == 3:
            return [1, 2]
        elif empty_time == 12:
            return [3, 4]
        elif empty_time == 48:
            return [5, 6]
        elif empty_time == 192:
            return [7, 8]
        elif empty_time == 768:
            return [9, 10]
        else:
            return []

    def is_empty_classroom_exist(self, target):
        """
        判断该教室是否已经存在
        :param target: 该教室字典
        :return:
        """
        for index, item in enumerate(self.source_list):
            if item['_id'] == target['_id']:
                return index
        return -1

    @staticmethod
    def sort_by_id(elem):
        """
        排序算法
        :param elem: list元素
        :return:
        """
        return elem['_id']
    
    def get_all_count(self):
        # 获取所有信息数量
        return self.all_empty_classroom

    def running(self):
        """
        启动函数
        :return:
        """
        # 1. 读取空教室文件
        if not self.read_empty_classroom():
            return False
        # 2. 空教室列表根据空闲时间排序
        try:
            self.source_list.sort(key=self.sort_by_id)
        except RuntimeError:
            logging.error("Sort empty-classroom FAILURE!")
            return False
        else:
            logging.info("Sort empty-classroom by _id SUCCESS!")
        # 3. 空教室列表写入文件
        if not self.write_empty_classroom():
            return False
        # 4. 正确执行完,退出
        return True


class WechatApp:
    def __init__(self, filename, collectionname, count):
        # 初始化变量
        self.grant_type = 'client_credential'
        self.appid = '***********'
        self.secret = '***********'
        self.env = '***********'
        self.empty_classroom_file = filename
        self.collectionname = collectionname
        self.access_token = ''
        self.header = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/79.0.3945.130 Safari/537.36 "
        }
        self.wxAPI_url = {
            'access_token': ['GET', 'https://api.weixin.qq.com/cgi-bin/token?grant_type={}&appid={}&secret={}'],
            'upload_file': ['POST', 'https://api.weixin.qq.com/tcb/uploadfile?access_token={}'],
            'db_import': ['POST', 'https://api.weixin.qq.com/tcb/databasemigrateimport?access_token={}'],
            'del_collection': ['POST', 'https://api.weixin.qq.com/tcb/databasecollectiondelete?access_token={}'],
            'add_collection': ['POST', 'https://api.weixin.qq.com/tcb/databasecollectionadd?access_token={}'],
            'update_database': ['POST', 'https://api.weixin.qq.com/tcb/databaseupdate?access_token={}'],
        }
        self.count = count
        self.finish_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def get_request(self, method, url, data):
        """
        发起网络请求
        :param method: 请求方式 'GET'或'POST'
        :param url: 地址
        :param data: 附带参数
        :return:
        """
        response = requests.request(method, url, json=data, headers=self.header)
        return json.loads(response.content.decode('utf-8'))

    def get_access_token(self):
        """
        获取access_token
        :return:
        """
        option = self.wxAPI_url['access_token']
        # 1. 构造url
        url = option[1].format(self.grant_type, self.appid, self.secret)
        # 2. 发送请求
        content = self.get_request(option[0], url, '')
        # 3. 赋值
        self.access_token = content['access_token']

    def upload_file(self, filepath, savepath):
        """
        上传文件
        :param filepath: 本地源文件路径
        :param savepath: 云端保存文件路径
        :return:
        """
        # 输出日志
        logging.info("Uploading File ......")
        logging.info("Local File Path: " + filepath)
        logging.info("Cloud File Path: " + savepath)
        # 1. 构造url
        option = self.wxAPI_url['upload_file']
        url = option[1].format(self.access_token)
        # 2. 构造请求参数
        data = {'env': self.env, 'path': savepath}
        # 3. 发送请求
        content = self.get_request(option[0], url, data)
        # 4. 判断结果
        if content['errcode'] == 0:
            # 成功
            logging.info("Upload File Part 1 SUCCESS!")
            file = {"file": open(filepath, "rb")}
            # 二次请求
            url = content["url"]
            data = {
                'key': savepath,
                'Signature': content["authorization"],
                'x-cos-security-token': content["token"],
                'x-cos-meta-fileid': content["cos_file_id"]
            }
            response = requests.post(url, data=data, headers=self.header, files=file)
            if response.status_code == 204:
                logging.info("Upload File Part 2 SUCCESS!")
                return True
            else:
                logging.error("Upload File Part 2 FAILURE!")
                return False
        else:
            logging.error("Upload File Part 1 FAILURE!")
            return False

    def db_import(self, cloud_fileid):
        """
        数据库导入
        :return:
        """
        # 输出日志
        logging.info("Importing Database ......")
        # 1. 构造url
        option = self.wxAPI_url['db_import']
        url = option[1].format(self.access_token)
        # 2. 构造请求参数
        data = {
            "env": self.env,
            "collection_name": self.collectionname,
            "file_path": cloud_fileid,
            "file_type": 1,
            "stop_on_error": False,
            "conflict_mode": 2
        }
        # 3. 发送请求
        content = self.get_request(option[0], url, data)
        # 4. 判断结果
        if content['errcode'] == 0:
            # 成功
            logging.info("Importing Database SUCCESS!")
            return True
        else:
            logging.error("Importing Database FAILURE!")
            return False

    def del_collection(self):
        """
        删除集合
        :return:
        """
        # 输出日志
        logging.info("Deleting Collection ......")
        # 1. 构造url
        option = self.wxAPI_url['del_collection']
        url = option[1].format(self.access_token)
        # 2. 构造请求参数
        data = {
            "env": self.env,
            "collection_name": self.collectionname,
        }
        # 3. 发送请求
        content = self.get_request(option[0], url, data)
        # 4. 判断结果
        if content['errcode'] == 0:
            logging.info("Delete Collection SUCCESS!")
            return True
        else:
            logging.error("Delete Collection FAILURE!")
            return False

    def add_collection(self):
        """
        新增集合
        :return:
        """
        # 输出日志
        logging.info("Adding Collection ......")
        # 1. 构造url
        option = self.wxAPI_url['add_collection']
        url = option[1].format(self.access_token)
        # 2. 构造请求参数
        data = {
            "env": self.env,
            "collection_name": self.collectionname,
        }
        # 3. 发送请求
        content = self.get_request(option[0], url, data)
        # 4. 判断结果
        if content['errcode'] == 0:
            # 成功
            logging.info("Add Collection SUCCESS!")
            return True
        else:
            logging.error("Add Collection FAILURE!")
            return False
    
    def update_database(self, query):
        """
        更新记录
        :return:
        """
        # 输出日志
        logging.info("Updating Database ......")
        # 1. 构造url
        option = self.wxAPI_url['update_database']
        url = option[1].format(self.access_token)
        # 2. 构造请求参数
        data = {
            "env": self.env,
            "query": query,
        }
        # 3. 发送请求
        content = self.get_request(option[0], url, data)
        # 4. 判断结果
        if content['errcode'] == 0:
            # 成功
            logging.info("Update Database SUCCESS!")
            return True
        else:
            logging.error("Update Database FAILURE!")
            return False

    def check_environment(self):
        # 若本地access_token为空，则获取
        if self.access_token == '':
            return self.get_access_token()

    def running(self, date):
        """
        启动函数
        :param date: 当前的日期
        :return:
        """
        # 1. 确保有access_token，时效2小时
        self.check_environment()
        # 2. 上传文件，获取cloudid
        path = 'weNjtech/classroom/' + date + '.json'
        if not self.upload_file(self.empty_classroom_file, path):
            return False
        # 3. 删除云端集合
        if not self.del_collection():
            return False
        # 4. 修改公共字典，锁
        query_str = "db.collection(\"weNjtech-publicDict\").doc(\"dict003\").update({data: {isAvailable: false, notice: \"数据维护中\"}})"
        if not self.update_database(query_str):
            return False
        # 5. 新增云端集合
        if not self.add_collection():
            return False
        # 6. 数据导入集合
        if not self.db_import(path):
            return False
        # 7. 修改公共字典，释放锁
        query_str = "db.collection(\"weNjtech-publicDict\").doc(\"dict003\").update({data: {isAvailable: true, count:" + str(self.count) + ",time:\"" + self.finish_time + "\"}})"
        if not self.update_database(query_str):
            return False
        # 8. 处理成功,返回
        return True


if __name__ == '__main__':
    # 设置日志属性
    logging.basicConfig(level=logging.INFO, filename='python.log', filemode='a', format='%(asctime)s - %(pathname)s[line:%(lineno)d] - %(levelname)s: %(message)s')
    # 定义当前日期 如'20200504'
    now_date = str(datetime.datetime.now().strftime('%Y%m%d'))
    # 本地爬取的原始数据
    init_empty_classroom_file = './emptyClass.json'
    # 处理后的数据
    final_empty_classroomm_file = './classroom/' + now_date + '.json'
    # 云端存储数据的集合名
    collection_name = 'weNjtech-classroom'

    # 输出日志
    logging.info("")
    logging.info("------------START------------")
    logging.info("File Date: " + now_date)
    logging.info("Origin File Path: " + init_empty_classroom_file)
    logging.info("Final File Path: " + final_empty_classroomm_file)
    logging.info("WeChat Collection Name: " + collection_name)

    # 1. 分析爬取的数据，查重并导出成最终待上传的文件
    logging.info("------------PART 1------------")
    EC = EmptyClassroom(init_empty_classroom_file, final_empty_classroomm_file)
    if not EC.running():
        logging.error("------------Part 1 Failure------------")
        exit()
    count = EC.get_all_count()
    logging.info("Count: " + str(count))
    if count == 0:
    	logging.info("Count is Null! Restarting...")
    	time.sleep(300)
    	subprocess.call("./run.sh", shell=True)
    	exit()

    # 2. 操作微信小程序API，上传数据库
    logging.info("------------PART 2------------")
    if not WechatApp(final_empty_classroomm_file, collection_name, count).running(now_date):
        logging.error("------------Part 2 Failure------------")
        exit()

    # 输出日志
    logging.info("------------END------------")
    logging.info("")
