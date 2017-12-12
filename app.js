// 系统配置
const config = require('config')
const port = config.server.port
const controllerRoot = config.server.controllerRoot
// 应用服务
const Koa = require('koa')
const koaBody = require('koa-body')
const mount = require('koa-mount')
const xnosql = require(__dirname + '/xnosql_modules/koa-xnosql/index.js')

// 日志相关
const log = require('tracer').colorConsole({ level: config.log.level })

// 初始化应用服务器
const app = new Koa()
// 入参JSON解析
app.use(koaBody())

// 引入koa-xnosql中间件
xnosql.initConnect(config.db.url)
app.use(mount(controllerRoot, xnosql.routes()))

// 开始服务监听
app.listen(port)

log.info(`XNosql应用启动【执行环境:${process.env.NODE_ENV},端口:${port}】`)
log.info(`[POST]http://localhost:${port}/xnosql/MODEL/create`)
log.info(`[POST]http://localhost:${port}/xnosql/MODEL/update`)
log.info(`[POST]http://localhost:${port}/xnosql/MODEL/query`)
log.info(`[GET ]http://localhost:${port}/xnosql/MODEL/get/:id`)
log.info(`[GET ]http://localhost:${port}/xnosql/MODEL/destroy/:id`)