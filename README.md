# koa-xnosql
NoSql服务应用，基于koa-xnosql中间件，快速构建轻量小巧灵活的NoSql服务

[传送门：XServer官网文档](http://www.xserver.top)

整体框架使用说明
>
	1,config/default.js中设置数据库连接，执行npm install
	2,node app.js(启动)

单独使用x-nosql中间件(任意koa应用均可集成)
>
	1, npm install koa-xnosql --save

	2, let xnosql = require('koa-xnosql')

	3, xnosql.init(app, config.server)

框架目录结构
>
	├── app.js
	├── config
	│   ├── default.json
	│   ├── develop.json
	│   └── production.json
	├── node_modules
	├── package.json
	├── src
	└── xnosql_modules
	    └── koa-xnosql

RESTful规则
>
	[POST]http://host:port/xnosql/MODEL/create
	[POST]http://host:port/xnosql/MODEL/delete/:id
	[POST]http://host:port/xnosql/MODEL/update
	[GET ]http://host:port/xnosql/MODEL/query
	[GET ]http://host:port/xnosql/MODEL/feed
	[GET ]http://host:port/xnosql/MODEL/page
	[GET ]http://host:port/xnosql/MODEL/get/:id

例子
>
	以一个用户模块为例，需要对用户进行增删改查:
	需要注意的是_id或id可进行匹配处理
	[POST]http://host:port/xnosql/user_model/create
		post body:{"username":"cheney","password":"123"}
	[POST]http://host:port/xnosql/user_model/delete/1
	[POST]http://host:port/xnosql/user_model/update
		post body:{id:1,"username":"cheney","password":"456"}
	[GET ]http://host:port/xnosql/user_model/query?username=cheney
	[GET ]http://host:port/xnosql/user_model/feed?skip=&limit=
	[GET ]http://host:port/xnosql/user_model/page?sortBy=createAt&sortOrder=-1
	[GET ]http://host:port/xnosql/user_model/get/1

帮助联系
>
	作者:cheneyxu
	邮箱:457299596@qq.com
	QQ:457299596

更新日志
>
	2017.04.29:无后端理念确认，1.0版本推出
	2017.06.06:统一使用连接池，1.1版本推出
	2017.12.04:精简更新所有依赖包
	2017.12.12:更新koa-body
	2018.02.04:更新所有依赖，增加支持多层中间层业务流转，全新1.0版本发布
	2018.02.09:增加自动分页查询路由
	2018.10.14:更新所有依赖
	2018.10.29:更新所有依赖
	2019.01.05:更新所有依赖，增加路由/insert和/delete
	2019.01.13:增加mongodb的封装方法对于insertOne和insertMany的判断
	2019.07.10:更新所有依赖
	2019.07.30:兼容id与_id，精简日志，2.0版本推出
	2019.08.06:采用原生mondodb对象，重构API
	2019.08.08:支持mongo rs
	2019.08.09:完善分页
	2019.08.10:完善分页
	2019.08.12:增加查询筛选
	2019.08.13:增加默认配置项
	2019.08.19:创建时间修正，mongodb驱动更新
	2019.12.30:删除接口默认24位ID为_id，依赖更新
	2020.06.19:新增跳页接口，依赖更新
	2020.06.20:新增接口仅支持单条插入，完善新增默认字段
	2020.06.22:输出字段_id转为id



