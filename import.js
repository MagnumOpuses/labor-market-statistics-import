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

const oracledb = require('./services/oracleDB');
const mongoDB = require('./services/mongodb');

const importExportSokandeData = async  (manad) => {
    let bind = { manad };
    let sql = "select * from SOKANDE where manad=:manad";
    try{
        console.log("Month: "+manad+". Getting SOKANDE data....");
        let dbResult = await oracledb.executeSQLStatement(sql, bind);
        console.log("Result from relational database:"+dbResult.rows.length)
        await mongoDB.insertMongo(dbResult.rows, mongoDB.TableEnum.sokande);
    } catch (err) {
        console.log(err);
    }
};

const importExportPlatserData = async (manad) => {
  let bind = { manad };
  let sql = "select * from PLATSER where manad =:manad";
  try{
      console.log("Month: "+manad+". Getting PLATSER data....");
      let dbResult = await oracledb.executeSQLStatement(sql, bind);
      console.log("Result from relational database:"+dbResult.rows.length)
      await mongoDB.insertMongo(dbResult.rows, mongoDB.TableEnum.platser);

  }catch (e) {
      console.log(e);
  }
};
const importExportArbetskraftData = async (manad) => {
    let bind = { manad };
    let sql = "select * from ARBETSKRAFT where manad =:manad";
    try{
        console.log("Month: "+manad+". Getting  ARBETSKRAFT data....");
        let dbResult = await oracledb.executeSQLStatement(sql, bind);
        //TODO: Insert result into MongDB (Remeber to erase collection before batch)
        await mongoDB.insertMongo(dbResult.rows, mongoDB.TableEnum.arbetskraft);
        console.log("Result from relational database:"+dbResult.rows.length)
    }catch (e) {
        console.log(e);
    }
};


const importExportData = async () =>{
    try{
        //We will do MANAD search for each table
        //SOKANDE
        let data = await oracledb.getMonadFromDB("select distinct MANAD from SOKANDE ORDER BY MANAD");
        console.log('Fetching sokande data for each month...')
        for(let index = 0 ; index<data.length; index++) {
            console.log(`Sokandedata for manad: ${ data[index].MANAD }`);
            await importExportSokandeData(data[index].MANAD);
        }

        //PLATSER
        data = await oracledb.getMonadFromDB("select distinct MANAD from PLATSER ORDER BY MANAD");
        for(let index = 0 ; index<data.length; index++) {
            console.log(`Platserdata for manad: ${ data[index].MANAD }`);
            await importExportPlatserData(data[index].MANAD);
        }
        //ARBETSKRAFT
        data = await oracledb.getMonadFromDB("select distinct MANAD from ARBETSKRAFT ORDER BY MANAD")
        for(let index = 0 ; index<data.length; index++) {
            console.log(`Arbetskraft for manad: ${ data[index].MANAD }`);
            await importExportArbetskraftData(data[index].MANAD);
        }
    } catch (err) {
        console.log(err);
    }
};

const dateTime = () =>{
    return new Date().toISOString().replace(/T/,':').replace(/\..+/,'').replace(/-/g,'');
}


//TODO: Find out all MANAD that exists in the DB "select distinct MANAD from SOKANDE ORDER BY MANAD;"
//TODO: Compare OracleDB MANAD with MANAD in docDB (fetch or not fetch?)
//TODO: It is possibleIs to fill upp one collection and rename it to 'prod' collection (shorten the offline time)
//TODO: Select MONTH distinct from DB and use it to fetch data in chunks.

(async function() {
    
    await oracledb.startup();
    console.log(dateTime() + " Importing data starts...")
    await mongoDB.createIndex('arbetskraft', ['MANAD', 'LANSKOD', 'KOMMUNKOD']);
    //await importExportSokandeData('2020-04');
    //await importExportPlatserData('2020-04');
    //await importExportArbetskraftData('2020-04');
    //await importExportData();
    //TODO: cretate indexes
    //process.exit(0);
    console.log(dateTime()+" Importing data done.")
})();

/**
 * //Change name on collection...
 * try{
*       const uri = "mongodb://statuser:kalle123@localhost:27017/statistik"; //TODO: Move this to .env
        const client = new MongoClient(uri,{ useUnifiedTopology: true });
        await client.connect(); 
        let mongoDatabase = client.db('statistik');
        collection = mongoDatabase.collection("test1");
        await collection.insertOne({test:"ettTest"});
        //Should be copy or clone...
        await mongoDatabase.collection("t2").rename("t3",{dropTarget:true});
       
    }catch (err) {
        console.log(err);
    }finally(){
         client.close()
    }
 */