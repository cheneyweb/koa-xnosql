const MongoClient = require('mongodb').MongoClient
const log = require('tracer').colorConsole()

var mongodb = {
    // dburl: '',
    db: null,
    insert: async function (collectionName, obj) {
        // let db, result
        try {
            // db = await MongoClient.connect(this.dburl)
            result = await this.db.collection(collectionName).insertOne(obj)
            // db.close()
        } catch (e) {
            log.error(e.message)
        }
        return result
    },
    update: async function (collectionName, query, obj) {
        // let db, result
        try {
            // db = await MongoClient.connect(this.dburl)
            result = await this.db.collection(collectionName).updateOne(query, obj)
            // db.close()
        } catch (e) {
            log.error(e.message)
        }
        return result
    },
    find: async function (collectionName, query) {
        // let db, result
        try {
            // db = await MongoClient.connect(this.dburl)
            result = await this.db.collection(collectionName).find(query).toArray()
            // db.close()
        } catch (e) {
            log.error(e.message)
        }
        return result
    },
    remove: async function (collectionName, query) {
        // let db, result
        try {
            // db = await MongoClient.connect(this.dburl)
            result = await this.db.collection(collectionName).remove(query)
            // db.close()
        } catch (e) {
            log.error(e.message)
        }
        return result
    },
    findOne: async function (collectionName, query) {
        // let db, result
        try {
            // db = await MongoClient.connect(this.dburl)
            result = await this.db.collection(collectionName).findOne(query)
            // db.close()
        } catch (e) {
            log.error(e.message)
        }
        return result
    }
}

module.exports = mongodb
