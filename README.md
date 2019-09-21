<p align="center">
  <img alt="logo" src="https://files-cdn.cnblogs.com/files/Lu-Yuyang/ngxc.bmp" width="200" style="margin-bottom: 10px;">
</p>
<h3 align="center">专属南工学子的校车查询</h3>

## 介绍

“南工校车”微信小程序，非南京工业大学官方小程序，只致力于服务南京工业大学江浦校区的师生等，同时也是自我磨练的项目。目前主要实现了如下功能：

- 查询双向的***象山线班车、亚青线班车***
- 查询指定日期、时间班车

## 快速体验

<p align="center">
  <img alt="logo" src="https://files-cdn.cnblogs.com/files/Lu-Yuyang/ngcx_erweima.bmp" width="500" style="margin-bottom: 10px;">
</p>


## 开发工具

[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html )、[微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)、[微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)



## 使用之前

在开发“南工校车”之前，请确保你已经对微信官方的 [小程序简易教程](https://mp.weixin.qq.com/debug/wxadoc/dev/) 和[微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)有所了解。

## 开发

1. 导入项目，使用测试号ID。创建自己的云开发环境，并在`app.js`中更改`env属性`。
2. 打开云开发控制台，创建数据库集合**schoolBusTable**,导入`/resource/schoolBusTable.json`。

## 目录结构

```
├──cloudfunctions			// 云函数
├──miniprogram				//主程序
|  ├──colorui				// colorui UI组件库
|  ├──dist					// Vant UI组件库
|  ├──images				// 图标
|  ├──pages					// 页面
|  |  ├──index				// 主页
|  |  |  ├──index.js
|  |  |  ├──index.json
|  |  |  ├──index.wxml
|  |  |  └──index.wxss
|  |  ├──template			// 模板页
|  |  |  ├──template.js
|  |  |  ├──template.json
|  |  |  ├──template.wxml
|  |  |  └──template.wxss
|  ├──utils					// 工具库
│  ├──app.js
|  ├──app.json
|  ├──app.wxss
|  └──sitemap.json
├──resource					// 环境资源
├──.gitignore
├──README.md
└──project.config.json

```



## 版权信息

该项目签署了[MIT 授权许可](http://www.opensource.org/licenses/mit-license.php)，详情请参阅 [LICENSE](LICENSE)

## 版本

v1.2.1，2019-09-11

- 修改部分显示样式
- 部分显示信息部署在数据库内
- 优化显示动画

v1.2.0，2019-09-08

- 增加“亚青线”
- 修改路线存储结构
- 增加校车线路名称的显示

v1.1.3，2019-08-30

- 设置“前一天”在今天状态下不可选
- 修改部分样式
- 修复无车时显示bug

v1.1.2，2019-08-27

- 完善日期星期的显示
- 顶部标题栏动效
- 班车卡片备注信息可滑动
- 增加顶部日期选择栏，可以快速选择前一天/后一天
- 优化逻辑，减少重复代码
- 更改主题颜色

v1.1.0，2019-08-26

- 新增可选择日期、时间、地点查询
- 优化标题栏
- 完善查询逻辑

v1.0.2，2019-08-26

- 引入vant组件
- 优化班车信息逻辑

v1.0.1

- 引入colorui组件
- 完成基础的班车显示

