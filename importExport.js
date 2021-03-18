/*
 * Import data from OracleDB into MongoDb
 * We import all data every time a update occure
 *  - is there data newer than in mongodb?
 *    - if true 
 *          do a compleate import to <default-collection-name>-<dateTime>.
 *          remove collection <default-collection-name>  and copy <default-collection>-<dateTime> to new default-collection-name
 *      else do nothing
 *
 * From three table ARBETSKRAFT, PLATSER och SOKANDE in Relational DB (Oracle) to Document DB (MongoDB)
 */
const oracledb = require('oracledb');
const { MongoClient } = require('mongodb');
const uri = "mongodb://statuser:kalle123@localhost:27017/statistik"; //TODO: Move this to .env
const client = new MongoClient(uri);

const TableEnum = Object.freeze({sokande:1, arbetskraft:2,  platser:3});

const startup = async () => {
    try {
        console.log('Initializing Oracle database module');
        //TODO: remove hard coded to be fetched environment.
        await oracledb.createPool({
            user: "publik_api",
            password: "aH72G15apI",
            connectString: "dwdb.ams.se/dw"});
    } catch (err) {
        console.error(err);
        process.exit(1); // Non-zero failure code
    }
};


const close = async () => {
    await oracledb.getPool().close();
};

const executeSQLStatement = (statement, binds = [], opts = {})  => {
    //executeMany(), http://oracle.github.io/node-oracledb/doc/api.html#executeoptions
    return new Promise(async (resolve, reject) => {
        let conn;
        opts.outFormat = oracledb.OBJECT;
        opts.autoCommit = true;
        try {
            conn = await oracledb.getConnection();
            const result = await conn.execute(statement, binds, opts);
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            if (conn) {
                try {
                    await conn.close();
                } catch (err) {
                    console.log(err);
                }
            }
        }
    });
};
/*
@param TableEnum value
 */
const insertMongo = async (docs, collection) => {
    try {
        await client.connect(); //MongoClient.connect(url, options, callback)
        const mongoDatabase = client.db("statistik");
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
        await client.close();
    }
};

const importExportSokandeData = async  (manad) => {
    let bind = { manad };
    let sql = "select * from SOKANDE where manad=:manad";
    try{
        let dbResult = await executeSQLStatement(sql, bind);
        //TODO: Insert result into MongDB (Remeber to erase collection before batch)
        await insertMongo(dbResult.rows, TableEnum.sokande);
    } catch (err) {
        console.log(err);
    }
};

const importExportPlatserData = async (manad) => {
  let bind = { manad };
  let sql = "select * from PLATSER where manad =:manad";
  try{
      let dbResult = await executeSQLStatement(sql, bind);
      //TODO: Insert result into MongDB (Remeber to erase collection before batch)
      await insertMongo(dbResult.rows, TableEnum.platser);

  }catch (e) {
      console.log(e);
  }
};
const importExportArbetskraftData = async (manad) => {
    let bind = { manad };
    let sql = "select * from ARBETSKRAFT where manad =:manad";
    try{
        let dbResult = await executeSQLStatement(sql, bind);
        //TODO: Insert result into MongDB (Remeber to erase collection before batch)
        await insertMongo(dbResult.rows, TableEnum.arbetskraft);

    }catch (e) {
        console.log(e);
    }
};
//TODO: move this?
const getMonadFromDB = async (sql) => {
    let bind = {};
    console.log('Fetch all months...');
    let dbResult = await executeSQLStatement(sql, bind);
    console.log(dbResult.rows);
    return JSON.parse(JSON.stringify(dbResult.rows));
};

const importExportData = async () =>{
    try{
        //We will do MANAD search for each table
        //SOKANDE
        let data = await getMonadFromDB("select distinct MANAD from SOKANDE ORDER BY MANAD");
        console.log('Fetching sokande data for each month...')
        for(let index = 0 ; index<data.length; index++) {
            console.log(`Sokandedata for manad: ${ data[index].MANAD }`);
            await importExportSokandeData(data[index].MANAD);
        }

        //PLATSER
        data = await getMonadFromDB("select distinct MANAD from PLATSER ORDER BY MANAD");
        for(let index = 0 ; index<data.length; index++) {
            console.log(`Platserdata for manad: ${ data[index].MANAD }`);
            await importExportPlatserData(data[index].MANAD);
        }
        //ARBETSKRAFT
        data = await getMonadFromDB("select distinct MANAD from ARBETSKRAFT ORDER BY MANAD")
        for(let index = 0 ; index<data.length; index++) {
            console.log(`Arbetskraft for manad: ${ data[index].MANAD }`);
            await importExportArbetskraftData(data[index].MANAD);
        }
    } catch (err) {
        console.log(err);
    }
};



//TODO: Find out all MANAD that exists in the DB "select distinct MANAD from SOKANDE ORDER BY MANAD;"
//TODO: Compare OracleDB MANAD with MANAD in docDB (fetch or not fetch?)
//TODO: It is possibleIs to fill upp one collection and rename it to 'prod' collection (shorten the offline time)
//TODO: Select MONTH distinct from DB and use it to fetch data in chunks.

(async function() {
    await startup();
    //await importExportSokandeData();
    //await importExportPlatserData('2020-04');
    //await importExportArbetskraftData('2020-04');
    await importExportData();
    //TODO: cretate indexes
})();