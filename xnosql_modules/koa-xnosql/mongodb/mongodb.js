var mongodb = {
    db: null,
    insert: async function (collectionName, obj) {
        // db = await MongoClient.connect(this.dburl)
        return await this.db.collection(collectionName).insertOne(obj)
        // db.close()
    },
    update: async function (collectionName, query, obj) {
        // db = await MongoClient.connect(this.dburl)
        return await this.db.collection(collectionName).updateOne(query, obj)
        // db.close()
    },
    find: async function (collectionName, query) {
        // db = await MongoClient.connect(this.dburl)
        return await this.db.collection(collectionName).find(query).toArray()
        // db.close()
    },
    remove: async function (collectionName, query) {
        // db = await MongoClient.connect(this.dburl)
        return await this.db.collection(collectionName).remove(query)
        // db.close()
    },
    findOne: async function (collectionName, query) {
        // db = await MongoClient.connect(this.dburl)
        return await this.db.collection(collectionName).findOne(query)
        // db.close()
    },
    findAndSort: async function (collectionName, query, sort) {
        // db = await MongoClient.connect(this.dburl)
        return await this.db.collection(collectionName).find(query).sort(sort).toArray()
        // db.close()
    }
}

module.exports = mongodb
