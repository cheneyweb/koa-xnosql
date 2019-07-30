var mongodb = {
    db: null,
    insert: function (collectionName, obj) {
        if (obj.constructor == Array) {
            return this.db.collection(collectionName).insertMany(obj)
        } else {
            return this.db.collection(collectionName).insertOne(obj)
        }
        // db.close()
    },
    update: function (collectionName, query, obj) {
        return this.db.collection(collectionName).updateOne(query, obj)
        // db.close()
    },
    deleteOne: function (collectionName, query) {
        return this.db.collection(collectionName).deleteOne(query)
    },
    find: function (collectionName, query) {
        return this.db.collection(collectionName).find(query).toArray()
        // db.close()
    },
    findOne: function (collectionName, query) {
        return this.db.collection(collectionName).findOne(query)
        // db.close()
    },
    findSort: function (collectionName, query, options) {
        let limit = options.limit
        let skip = options.skip || 0
        let sort = {}
        sort[options.sortBy] = +options.sortOrder
        if (limit) {
            return this.db.collection(collectionName).find(query).sort(sort).limit(limit).skip(skip).toArray()
        } else {
            return this.db.collection(collectionName).find(query).sort(sort).toArray()
        }
        // db.close()
    },

    // 已废弃
    remove: function (collectionName, query) {
        return this.db.collection(collectionName).remove(query)
        // db.close()
    },
    findAndSort: function (collectionName, query, sort, options) {
        if (options && options.limit) {
            options.skip = options.skip || 0
            return this.db.collection(collectionName).find(query).sort(sort).limit(options.limit).skip(options.skip).toArray()
        } else {
            return this.db.collection(collectionName).find(query).sort(sort).toArray()
        }
        // db.close()
    }
}

module.exports = mongodb
