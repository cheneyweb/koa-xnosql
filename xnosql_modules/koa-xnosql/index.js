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
const log = require('tracer').colorConsole()

function mongoConnect(options) {
    options.mongoOption = options.mongoOption || {}
    MongoClient.connect(options.mongodbUrl, { useNewUrlParser: true, ...options.mongoOption }, (err, database) => {
        if (err) {
            log.warn('mongo reconnecting...')
            setTimeout(mongoConnect(options), 1000)
        } else {
            global.mongo = database
            global.mongodb = router.mongodb = database.db(options.mongodbUrl.substring(options.mongodbUrl.lastIndexOf('/') + 1, options.mongodbUrl.length))
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
    let result
    try {
        if (ctx.request.body.constructor == Array) {
            result = await router.mongodb.collection(ctx.params.model_name).insertMany(ctx.request.body)
        } else {
            result = await router.mongodb.collection(ctx.params.model_name).insertOne(ctx.request.body)
        }
        ctx.body = okRes(result.insertedId)
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 删除实体对象
router.post('/:model_name/delete/:id', async (ctx, next) => {
    try {
        const query = ctx.params.id ? { 'id': isNaN(ctx.params.id) ? ctx.params.id : +ctx.params.id } : { '_id': ObjectId(ctx.params.id) }
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
    try {
        const query = ctx.request.body.id ? { 'id': ctx.request.body.id } : { '_id': ObjectId(ctx.request.body._id) }
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
        let result = await router.mongodb.collection(ctx.params.model_name).find(ctx.request.query).toArray()
        ctx.body = okRes(result)
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 复杂GET分页查询实体对象
router.get('/:model_name/page', async (ctx, next) => {
    let result
    try {
        let skip = ctx.request.query.skip
        let limit = ctx.request.query.limit
        let sortBy = ctx.request.query.sortBy
        let sortOrder = ctx.request.query.sortOrder
        let sort = {}
        sort[sortBy] = +sortOrder
        delete ctx.request.query.skip
        delete ctx.request.query.limit
        delete ctx.request.query.sortBy
        delete ctx.request.query.sortOrder
        if (limit) {
            result = await router.mongodb.collection(ctx.params.model_name).find(ctx.request.query).sort(sort).limit(+limit).skip(+skip).toArray()
        } else {
            result = await router.mongodb.collection(ctx.params.model_name).find(ctx.request.query).sort(sort).toArray()
        }
        ctx.body = okRes(result)
        return next()
    } catch (error) {
        log.error(error)
        ctx.body = errRes('路由服务异常')
    }
})
// 简单GET获取实体对象
router.get('/:model_name/get/:id', async (ctx, next) => {
    try {
        const query = ctx.params.id ? { 'id': isNaN(ctx.params.id) ? ctx.params.id : +ctx.params.id } : { '_id': ObjectId(ctx.params.id) }
        let result = await router.mongodb.collection(ctx.params.model_name).findOne(query)
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
