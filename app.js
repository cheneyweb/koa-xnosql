// 系统配置
const config = require('config')
const port = config.get('server').port
const controllerRoot = config.get('server').controllerRoot
// 应用服务
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const mount = require('koa-mount')
const xnosql = require(__dirname + '/xnosql_modules/koa-xnosql/index.js')

// 日志相关
const log = require('tracer').colorConsole({ level: config.get('log').level })

// 初始化应用服务器
const app = new Koa()
// 入参JSON解析
app.use(bodyParser())

/**
 * 使用路由统一控制(目前支持以下5种RESTful请求)
 * [POST]http://host:port/xnosql/model/create
 * [POST]http://host:port/xnosql/model/update
 * [POST]http://host:port/xnosql/model/query
 * [GET]http://host:port/xnosql/model/get/:id
 * [GET]http://host:port/xnosql/model/destroy/:id
 */
// 引入koa-xbatis中间件
xnosql.dburl = config.db.url
app.use(mount(controllerRoot, xnosql.routes()))

// 开始服务监听
app.listen(port, function() {
    log.info(`XNosql服务已启动,执行环境:${process.env.NODE_ENV},端口:${port}...`)
    log.info(`[POST]http://host:${port}/xnosql/MODEL/create`)
    log.info(`[POST]http://host:${port}/xnosql/MODEL/update`)
    log.info(`[POST]http://host:${port}/xnosql/MODEL/query`)
    log.info(`[GET]http://host:${port}/xnosql/MODEL/get/:id`)
    log.info(`[GET]http://host:${port}/xnosql/MODEL/destroy/:id`)
})