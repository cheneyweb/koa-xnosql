var mongodb = {
    db: null,
    insert: async function (collectionName, obj) {
        return await this.db.collection(collectionName).insertOne(obj)
        // db.close()
    },
    update: async function (collectionName, query, obj) {
        return await this.db.collection(collectionName).updateOne(query, obj)
        // db.close()
    },
    find: async function (collectionName, query) {
        return await this.db.collection(collectionName).find(query).toArray()
        // db.close()
    },
    remove: async function (collectionName, query) {
        return await this.db.collection(collectionName).remove(query)
        // db.close()
    },
    findOne: async function (collectionName, query) {
        return await this.db.collection(collectionName).findOne(query)
        // db.close()
    },
    findAndSort: async function (collectionName, query, sort, options) {
        if (options && options.limit) {
            options.skip = options.skip || 0
            return await this.db.collection(collectionName).find(query).sort(sort).limit(options.limit).skip(options.skip).toArray()
        } else {
            return await this.db.collection(collectionName).find(query).sort(sort).toArray()
        }
        // db.close()
    }
}

module.exports = mongodb
