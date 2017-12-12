# koa-xnosql
NoSql服务应用，基于koa-xnosql中间件，快速构建轻量小巧灵活的NoSql服务

[传送门：XServer官网文档](http://xserver.top)

整体框架使用说明
>
	1,config/default.js中设置数据库连接，执行npm install
	2,node app.js(启动)

单独使用x-nosql中间件(任意koa应用均可集成)
>
	1, npm install koa-xnosql --save

	2, let xnosql = require('koa-xnosql')

	3, xnosql.initConnect(config.db.url)

	4, app.use(mount(controllerRoot, xnosql.routes()))

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
	[POST]http://host:port/xnosql/MODEL/update
	[POST]http://host:port/xnosql/MODEL/query
	[GET ]http://host:port/xnosql/MODEL/get/:id
	[GET ]http://host:port/xnosql/MODEL/destroy/:id

例子
>
	以一个用户模块为例，需要对用户进行增删改查:
	需要注意的是默认自动创建id,createdAt,updatedAt三个字段，无须人工处理
	[POST]http://host:port/xnosql/user_model/create
		post body:{"username":"cheney","password":"123"}
	[POST]http://host:port/xnosql/user_model/update
		post body:{id:1,"username":"cheney","password":"456"}
	[POST]http://host:port/xnosql/user_model/query
		post body:{"username":"cheney","password":"123"}
	[GET]http://host:port/xnosql/user_model/get/1
	[GET]http://host:port/xnosql/user_model/destroy/1

帮助联系
>
	作者:cheneyxu，chenxingling
	邮箱:457299596@qq.com
	QQ:457299596

更新日志
>
	2017.04.29:无后端理念确认，1.0版本推出
	2017.06.06:统一使用连接池，1.1版本推出
	2017.12.04:精简更新所有依赖包
	2017.12.12:更新koa-body