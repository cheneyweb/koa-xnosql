// 路由相关
const Router = require('koa-router')
const mount = require('koa-mount')
// 初始化路由
const router = new Router()
// 控制器加载
const fs = require('fs')
// 持久化相关
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID
// 日志相关
const moment = require('moment')
const log = require('tracer').colorConsole()

function mongoConnect(options) {
    options.mongoOption = options.mongoOption || {}
    MongoClient.connect(options.mongodbUrl, { useNewUrlParser: true, ...options.mongoOption }, (err, database) => {
        if (err) {
            log.warn('mongo reconnecting...')
            setTimeout(() => mongoConnect(options), 1000)
        } else {
            global.mongo = database
            global.mongodb = router.mongodb = options.mongodbName ? database.db(options.mongodbName) : database.db(options.mongodbUrl.substring(options.mongodbUrl.lastIndexOf('/') + 1, options.mongodbUrl.length))
            global.getMongoSession = async () => {
                const session = await database.startSession()
                await session.startTransaction({
                    readConcern: { level: 'majority' },
                    writeConcern: { w: 'majority' }
                })
                return session
            }
        }
    })
}

/**
 * 初始化数据库连接，加载所有中间件路由
 */
router.init = function (app, options) {
    mongoConnect(options)
    const middlewareDir = `${process.cwd()}${options.middlewareDir || '/src/middleware/'}`
    const controllerRoot = options.xnosqlRoot || '/xnosql'
    router.xnosqlOption = options
    fs.readdirSync(middlewareDir).forEach((filename) => {
        if (filename.startsWith('pre')) {
            let router = require(`${middlewareDir}/${filename}`)
            app.use(mount(controllerRoot, router.routes()))
        }
    })
    // log.info('xnosql所有前置路由已加载')
    app.use(mount(controllerRoot, router.routes()))
    // log.info('xnosql所有执行路由已加载')
    fs.readdirSync(middlewareDir).forEach((filename) => {
        if (filename.startsWith('after')) {
            let router = require(`${middlewareDir}/${filename}`)
            app.use(mount(controllerRoot, router.routes()))
        }
    })
    // log.info('xnosql所有后置路由已加载')
}
// 创建实体对象
router.post('/:model_name/create', async (ctx, next) => {
    if (router.xnosqlOption.defaultId) {
        ctx.request.body[router.xnosqlOption.defaultId] = _generateUUID()
    }
    if (router.xnosqlOption.defaultCreateAt) {
        ctx.request.body[router.xnosqlOption.defaultCreateAt] = Date.now()
        ctx.request.body[`${router.xnosqlOption.defaultCreateAt}Str`] = moment(ctx.request.body[router.xnosqlOption.defaultCreateAt]).utcOffset(router.xnosqlOption.defaultUTC || 8).format('YYYY-MM-DD HH:mm:ss')
    }
    if (router.xnosqlOption.defaultUpdateAt) {
        ctx.request.body[router.xnosqlOption.defaultUpdateAt] = Date.now()
        ctx.request.body[`${router.xnosqlOption.defaultUpdateAt}Str`] = moment(ctx.request.body[router.xnosqlOption.defaultUpdateAt]).utcOffset(router.xnosqlOption.defaultUTC || 8).format('YYYY-MM-DD HH:mm:ss')
    }
    if (router.xnosqlOption.defaultBlockBy) {
        ctx.request.body[router.xnosqlOption.defaultBlockBy] = router.xnosqlOption.defaultBlockByValue || "N"
    }
    let result
    try {
        // if (ctx.request.body.constructor == Array) {
        //     result = await router.mongodb.collection(ctx.params.model_name).insertMany(ctx.request.body)
        // } else {
        result = await router.mongodb.collection(ctx.params.model_name).insertOne(ctx.request.body)
        // };
        ctx.body = okRes({ id: result.insertedId, ...ctx.request.body })
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 删除实体对象
router.post('/:model_name/delete/:id', async (ctx, next) => {
    let query
    try {
        if (router.xnosqlOption.defaultId) {
            query = { _id: ctx.params.id }
        } else {
            query = ctx.params.id.length != 24 ? { 'id': isNaN(ctx.params.id) ? ctx.params.id : +ctx.params.id } : { '_id': ObjectId(ctx.params.id) }
        }
        let result = await router.mongodb.collection(ctx.params.model_name).deleteOne(query)
        ctx.body = okRes(result.result.n.toString())
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 更新实体对象(根据ID替换)
router.post('/:model_name/update', async (ctx, next) => {
    let query
    try {
        if (router.xnosqlOption.defaultId) {
            query = { _id: ctx.request.body._id || ctx.request.body.id }
        } else {
            query = ctx.request.body.id ? { 'id': ctx.request.body.id } : { '_id': ObjectId(ctx.request.body._id) }
        }
        delete ctx.request.body._id
        delete ctx.request.body.id
        let result = await router.mongodb.collection(ctx.params.model_name).updateOne(query, { $set: ctx.request.body })
        ctx.body = okRes(result.result.nModified.toString())
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 复杂GET查询实体对象
router.get('/:model_name/query', async (ctx, next) => {
    try {
        let findOption = ctx.request.query.findOption                   // 查询选项
        delete ctx.request.query.findOption
        let result = await router.mongodb.collection(ctx.params.model_name).find(ctx.request.query, findOption).toArray()
        ctx.body = okRes(result)
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 跳页分页查询
router.get('/:model_name/feed', async (ctx, next) => {
    try {
        let skip = +ctx.request.query.skip || 0
        let limit = +ctx.request.query.limit || router.xnosqlOption.defaultLimit || 100
        let sort = {}
        // 自定义排序
        if (ctx.request.query.sort) {
            sort = ctx.request.query.sort
        }
        // 默认排序
        else {
            let sortBy = ctx.request.query.sortBy || router.xnosqlOption.defaultSortBy || 'id'
            sort[sortBy] = +ctx.request.query.sortOrder || router.xnosqlOption.defaultSortOrder || -1
        }
        // 查询选项
        let findOption = ctx.request.query.findOption
        // 查询处理
        delete ctx.request.query.skip
        delete ctx.request.query.limit
        delete ctx.request.query.sort
        delete ctx.request.query.sortBy
        delete ctx.request.query.sortOrder
        // 输出查询日志
        if (router.xnosqlOption.defaultLog) {
            log.info(`\n[QUERY] ${JSON.stringify(ctx.request.query)}\n[OPTION] ${JSON.stringify(findOption)}\n[SORT] ${JSON.stringify(sort)}\n[LIMIT-SKIP] ${limit}-${skip}`)
        }
        let result = await router.mongodb.collection(ctx.params.model_name).find(ctx.request.query, findOption).sort(sort).limit(limit).skip(skip).toArray()
        if (router.xnosqlOption.defaultId == '_id') {
            for (let item of result) {
                item.id = item._id
            }
        }
        ctx.body = okRes(result)
        ctx.body.skip = result.length > 0 ? skip + result.length : null
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})

// 复杂GET分页查询实体对象
router.get('/:model_name/page', async (ctx, next) => {
    try {
        let sort = {}
        let startKey = ctx.request.query.startKey                                                                   // 起始值
        let sortBy = ctx.request.query.sortBy || router.xnosqlOption.defaultSortBy || 'id'                          // 索引键
        let sortOrder = sort[sortBy] = +ctx.request.query.sortOrder || router.xnosqlOption.defaultSortOrder || -1   // 顺序
        let limit = +ctx.request.query.limit || router.xnosqlOption.defaultLimit || 100                             // 返回数量
        let findOption = ctx.request.query.findOption                                                               // 查询选项
        delete ctx.request.query.startKey
        delete ctx.request.query.sortBy
        delete ctx.request.query.sortOrder
        delete ctx.request.query.limit
        delete ctx.request.query.findOption
        // 升序
        if (sortOrder == 1 && startKey) {
            ctx.request.query[sortBy] = { $gt: startKey }
        }
        // 降序
        else if (sortOrder == -1 && startKey) {
            ctx.request.query[sortBy] = { $lt: startKey }
        }
        let result = await router.mongodb.collection(ctx.params.model_name).find(ctx.request.query, findOption).sort(sort).limit(limit).toArray()
        ctx.body = okRes(result)
        ctx.body.startKey = result.length == limit ? result[limit - 1][sortBy] : null
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 简单GET获取实体对象
router.get('/:model_name/get/:id', async (ctx, next) => {
    let query
    try {
        if (router.xnosqlOption.defaultId) {
            query = { _id: ctx.params.id }
        } else {
            query = ctx.params.id ? { 'id': isNaN(ctx.params.id) ? ctx.params.id : +ctx.params.id } : { '_id': ObjectId(ctx.params.id) }
        }
        // 查询选项
        let findOption = ctx.request.query.findOption
        delete ctx.request.query.findOption
        let result = await router.mongodb.collection(ctx.params.model_name).findOne(query, findOption)
        if (router.xnosqlOption.defaultId == '_id' && result) {
            result.id = result._id
        }
        ctx.body = okRes(result)
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})

// // 旧版本兼容
// router.post('/:model_name/insert', async (ctx, next) => {
//     try {
//         let result = await mongodb.insert(ctx.params.model_name, ctx.request.body)
//         ctx.body = okRes(result.insertedId)
//         return next()
//     } catch (error) {
//         log.error(error)
//         ctx.body = errRes('路由服务异常')
//     }
// })
// router.get('/:model_name/delete/:id', async (ctx, next) => {
//     try {
//         const query = { '_id': ObjectId(ctx.params.id) }
//         let result = await mongodb.remove(ctx.params.model_name, query)
//         ctx.body = okRes(result.result.n.toString())
//         return next()
//     } catch (error) {
//         log.error(error)
//         ctx.body = errRes('路由服务异常')
//     }
// })
// router.get('/:model_name/destroy/:id', async (ctx, next) => {
//     try {
//         const query = { '_id': ObjectId(ctx.params.id) }
//         let result = await mongodb.remove(ctx.params.model_name, query)
//         ctx.body = okRes(result.result.n.toString())
//         return next()
//     } catch (error) {
//         log.error(error)
//         ctx.body = errRes('路由服务异常')
//     }
// })
// // 复杂查询实体对象
// router.post('/:model_name/query', async (ctx, next) => {
//     try {
//         let result = await mongodb.find(ctx.params.model_name, ctx.request.body)
//         ctx.body = okRes(result)
//         return next()
//     } catch (error) {
//         log.error(error)
//         ctx.body = errRes('路由服务异常')
//     }
// })
// // 复杂分页查询实体对象
// router.post('/:model_name/page', async (ctx, next) => {
//     try {
//         let options = ctx.request.body.options
//         let sort = ctx.request.body.sort
//         delete ctx.request.body.options
//         delete ctx.request.body.sort
//         let result = await mongodb.findAndSort(ctx.params.model_name, ctx.request.body, sort, options)
//         ctx.body = okRes(result)
//         return next()
//     } catch (error) {
//         log.error(error)
//         ctx.body = errRes('路由服务异常')
//     }
// })

function _generateUUID() {
    // let p0 = ("00000000" + Math.abs((Math.random() * 0xFFFFFFFF) | 0).toString(16)).substr(-8)
    // let p1 = ("00000000" + Math.abs((Math.random() * 0xFFFFFFFF) | 0).toString(16)).substr(-8)
    // return `${p0}${p1}`
    return Date.now().toString(36)
}

function okRes(res) {
    return { err: false, res }
}
function errRes(res) {
    return { err: true, res }
}

// function ucfirst(str) {
//     str = str.toLowerCase();
//     str = str.replace(/\b\w+\b/g, function(word) {
//         return word.substring(0, 1).toUpperCase() + word.substring(1);
//     });
//     return str;
// }

// function transJavaStyle(str) {
//     var re = /_(\w)/g;
//     return str.replace(re, function($0, $1) {
//         return $1.toUpperCase();
//     });
// }

module.exports = router
