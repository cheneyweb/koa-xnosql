import {MongoClient, Db, ClientSession} from 'mongodb'

declare global {
    namespace NodeJS {
        interface Global {
            mongo: MongoClient
            mongodb: Db
            getMongoSession() : Promise<ClientSession>
        }
    }
}