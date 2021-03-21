const MongoConfig = require('../config/mongodb');
const { MongoClient } = require('mongodb');

const TableEnum = Object.freeze({SOKANDE:'sokande', ARBETSKRAFT:'arbetskraft',  PLATSER:'platser'});

const showConfig = () =>{
    console.log(MongoConfig.dumpConfig());
}
/*
@param TableEnum value
 */
const insertMongo = async (docs, collectionEnum) => {
    let client;
    
    try {
        client = new MongoClient(MongoConfig.config.default_uri,{ useUnifiedTopology: true } );
        await client.connect(); //MongoClient.connect(url, options, callback)
        const mongoDatabase = client.db(MongoConfig.config.db_name);
        let collection = mongoDatabase.collection(TableEnum[collectionEnum]);
        // this option prevents additional documents from being inserted if one fails
        const options = { ordered: true };
        const result = await collection.insertMany(docs, options);
        console.log(`${result.insertedCount} documents were inserted into `+collectionEnum);
    } finally {
        if(client){
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

const create_Indexes_for_all_collections = async () => {
    try{
        //for(const [key, value] of Object.entries(mongoDB.TableEnum)){
        for(const collectionEnum in TableEnum){
            await createIndex(TableEnum[collectionEnum], ['MANAD', 'LANSKOD', 'KOMMUNKOD', 'AFKOD', 'KOEN', 'UNG_VUXEN', 'UTRIKESFODD', 'ANTAL']);
        }

    }catch (err) {
        console.log(err);
    }

}

module.exports = {
    insertMongo, createIndex, showConfig, create_Indexes_for_all_collections, TableEnum
}