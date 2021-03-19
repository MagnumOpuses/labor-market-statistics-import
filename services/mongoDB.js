const MongoConfig = require('../config/mongodb');
const { MongoClient } = require('mongodb');

const TableEnum = Object.freeze({sokande:1, arbetskraft:2,  platser:3});

/*
@param TableEnum value
 */
const insertMongo = async (docs, collection) => {
    let client;
    try {
        client = new MongoClient(MongoConfig.config.default_uri,{ useUnifiedTopology: true } );
        await client.connect(); //MongoClient.connect(url, options, callback)
        const mongoDatabase = client.db(MongoConfig.config.db_name);
        switch (collection) {
            case TableEnum.sokande :
                collection = mongoDatabase.collection("sokande");
                break;
            case TableEnum.platser :
                collection = mongoDatabase.collection("platser");
                break;
            case TableEnum.arbetskraft:
                collection = mongoDatabase.collection("arbetskraft");
                break;
            default:
                throw `Collection ${collection} do not exists`
        }
        // this option prevents additional documents from being inserted if one fails
        const options = { ordered: true };
        const result = await collection.insertMany(docs, options);
        console.log(`${result.insertedCount} documents were inserted`);
    } finally {
        if(client){
            await client.close();
        }
    }
};

const createWildIndex = async (collectionName) =>{
    let client;
    try{
        client = new MongoClient(MongoConfig.config.default_uri,{ useUnifiedTopology: true } );
        await client.connect();
        const mongoDatabase = client.db(MongoConfig.config.db_name);
        collection = mongoDatabase.collection(collectionName);
        await collection.createIndexes([
            {key: { '$**': 1 }}
        ])
    }catch(err){
        console.log(err);
    }finally{
        await client.close();
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
    try{
        client = new MongoClient(MongoConfig.config.default_uri,{ useUnifiedTopology: true } );
        await client.connect();
        const mongoDatabase = client.db(MongoConfig.config.db_name);
        collection = mongoDatabase.collection(collectionName);

        for (const key in keysToIndex){
            //Check if field exists in spec. collection
            //Prepare the querry object
            let q = {}
            q[keysToIndex[key]]={'$exists':true};
            result = await collection.findOne(q);

            if(result){
                //yes it exists
                console.log(keysToIndex[key]+" exists in "+collectionName+ ", creating index...");
                //Have to create a querry object for the createIndex function
                q = {};
                q[keysToIndex[key]]=1 //1=>ASC, -1=>DSC

                await collection.createIndex(q);
            }else{
                console.log("No "+keysToIndex[key]+" in "+collectionName)
            }
        }
    }catch(err){
        console.log(err);
    }finally{
        await client.close();
    }
};


module.exports = {
    insertMongo, createIndex
}