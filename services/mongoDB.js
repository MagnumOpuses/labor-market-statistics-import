const MongoConfig = require('../config/mongodb');
const { MongoClient } = require('mongodb');
const { LoggerModule } = require('../services/logging');

const TableEnum = Object.freeze({ SOKANDE: 'sokande', ARBETSKRAFT: 'arbetskraft', PLATSER: 'platser' });
const logger = LoggerModule.getLogger();

const showConfig = () => {
    logger.log('info', MongoConfig.dumpConfig());
}
/*
@param TableEnum value
 */
const insertMongo = async (docs, collectionEnum) => {
    let client;

    try {
        client = new MongoClient(MongoConfig.config.default_uri, { useUnifiedTopology: true });
        await client.connect(); //MongoClient.connect(url, options, callback)
        const mongoDatabase = client.db(MongoConfig.config.db_name);
        logger.log('info', `insert into collection: ${collectionEnum}`);
        let collection = mongoDatabase.collection(TableEnum[collectionEnum]);
        // this option prevents additional documents from being inserted if one fails
        const options = { ordered: true };
        const result = await collection.insertMany(docs, options);
        logger.log('info', `${result.insertedCount} documents were inserted into ${collectionEnum}`);
    } finally {
        if (client) {
            await client.close();
        }
    }
};

/**
 * Creat indexes on a specified collection.
 * It is possible to make this to create indexes in a batch by
 * providing multi field names to collection.createIndex() function
 * ref. http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#createIndex
 * @param {String} collectionName 
 * @param {Array with strings} keysToIndex 
 */
const createIndex = async (collectionName, keysToIndex) => {
    let client;
    try {
        client = new MongoClient(MongoConfig.config.default_uri, { useUnifiedTopology: true });
        await client.connect();
        const mongoDatabase = client.db(MongoConfig.config.db_name);
        collection = mongoDatabase.collection(collectionName);

        for (const key in keysToIndex) {
            //Check if field exists in spec. collection
            //Prepare the querry object
            let q = {}
            q[keysToIndex[key]] = { '$exists': true };
            result = await collection.findOne(q);

            if (result) {
                //yes it exists
                logger.log('info', keysToIndex[key] + " exists in " + collectionName + ", creating index...");
                //Have to create a querry object for the createIndex function
                q = {};
                q[keysToIndex[key]] = 1 //1=>ASC, -1=>DSC

                await collection.createIndex(q);
            } else {
                logger.log('warn', "No " + keysToIndex[key] + " in " + collectionName)
            }
        }
    } catch (err) {
        throw (err);
    } finally {
        await client.close();
    }
};

const create_Indexes_for_all_collections = async () => {
    try {
        //for(const [key, value] of Object.entries(mongoDB.TableEnum)){
        for (const collectionEnum in TableEnum) {
            await createIndex(TableEnum[collectionEnum], ['MANAD', 'LANSKOD', 'KOMMUNKOD', 'AFKOD', 'KOEN', 'UNG_VUXEN', 'UTRIKESFODD', 'ANTAL']);
        }

    } catch (err) {
        logger.log('warn', err);
        throw (err);
    }

};

const getAllCollections = async () => {
    const client = new MongoClient(MongoConfig.config.default_uri, { useUnifiedTopology: true });
    await client.connect();
    const mongoDatabase = client.db(MongoConfig.config.db_name);
    let collectionsInDB = await mongoDatabase.listCollections().toArray();
    //Extract names into new array
    let collectionNamesInDB = [];
    collectionsInDB.forEach((value, index, array) => {
        collectionNamesInDB.push(value.name);
    });
    return collectionNamesInDB;
};

const removeAllCollections = async () => {
    const client = new MongoClient(MongoConfig.config.default_uri, { useUnifiedTopology: true });
    //db.runCommand( { listCollections: 1 } );
    try {
        let collectionNamesInDB = await getAllCollections();
        await client.connect();
        const mongoDatabase = client.db(MongoConfig.config.db_name);
        //Check if collection exists before droping it..
        for (const collectionEnum in TableEnum) {
            logger.log('info', "Try to remove collection " + TableEnum[collectionEnum])
            if (collectionNamesInDB.includes(TableEnum[collectionEnum])) {
                logger.log('info', "Removing: " + TableEnum[collectionEnum]);
                collection = mongoDatabase.collection(TableEnum[collectionEnum]);
                await collection.drop();
            } else {
                logger.log('info', "Collection: " + TableEnum[collectionEnum] + " do not exist in DB");
            }
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    insertMongo, createIndex, showConfig, create_Indexes_for_all_collections, removeAllCollections, TableEnum
}