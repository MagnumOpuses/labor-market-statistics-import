/*
 * Import data from OracleDB into MongoDb
 * We import all data every time a update occure
 *  - is there data newer than in mongodb?
 *    - if true 
 *          alt.1 do a compleate import to <default-collection-name>-<dateTime>.
 *          remove collection <default-collection-name>  and copy <default-collection>-<dateTime> to new default-collection-name
 *          alt.2 import the new data...
 *      else do nothing
 *
 * From three table ARBETSKRAFT, PLATSER och SOKANDE in Relational DB (Oracle) to Document DB (MongoDB)
 */

const oracledb = require('./services/oracleDB');
const mongoDB = require('./services/mongoDB');

const importExportData = async  (collectionEnum, manad) => {
    let bind = { manad };
    let sql = "select * from "+collectionEnum+" where manad=:manad";
    try{
        console.log("Month: "+manad+". Getting "+collectionEnum+" data....");
        let dbResult = await oracledb.executeSQLStatement(sql, bind);
        console.log("Result from relational database:"+dbResult.rows.length)
        await mongoDB.insertMongo(dbResult.rows, collectionEnum);
    } catch (err) {
        console.log(err);
    }
};

const import_all_monthData_for_a_Collection = async (collectionEnum) =>{
    try{
        //We will do MANAD search for each table
        let data = await oracledb.getMonadFromDB("select distinct MANAD from "+collectionEnum+" ORDER BY MANAD");
        console.log('Fetching sokande data for each month...')
        for(let index = 0 ; index<data.length; index++) {
            console.log(`Sokandedata for manad: ${ data[index].MANAD }`);
            await importExportData(collectionEnum, data[index].MANAD);
        }
    } catch (err) {
        console.log(err);
    }
};
//TODO: Move this 
const dateTime = () =>{
    return new Date().toISOString().replace(/T/,':').replace(/\..+/,'').replace(/-/g,'');
}

const import_All_MonthData_for_all_collections= async () => {
    try{
        //for(const [key, value] of Object.entries(mongoDB.TableEnum)){
        for(const collectionEnum in mongoDB.TableEnum){
            console.log(collectionEnum);
            await import_all_monthData_for_a_Collection(collectionEnum);
        }

    }catch (err) {
        console.log(err);
    }

}
//TODO: Compare OracleDB MANAD with MANAD in docDB (fetch or not fetch?)
const importNewMonth = () =>{
    //string to date
    //Get last month from mongodb
    //Check with OracleDB if there is a new year-month to import
}
//TODO: It is possibleIs to fill upp one collection and rename it to 'prod' collection (shorten the offline time)

(async function() {
    
    await oracledb.init();
    mongoDB.showConfig();
    console.log(dateTime() + " Importing data starts...")
    await mongoDB.removeAllCollections();
    await import_All_MonthData_for_all_collections();
    await mongoDB.create_Indexes_for_all_collections();
    //await mongoDB.createIndex('arbetskraft', ['MANAD', 'LANSKOD', 'KOMMUNKOD', 'AFKOD']);
    //await importExportData(mongoDB.TableEnum.SOKANDE, '2020-04');
    //await importExportData(mongoDB.TableEnum.PLATSER, '2020-04');
    //await importExportData(mongoDB.TableEnum.ARBETSKRAFT, '2020-04');
    //await importExportPlatserData('2020-04');
    //await importExportArbetskraftData('2020-04');
    console.log(dateTime()+" Importing data done.");
    process.exit(0);
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