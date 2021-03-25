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

const oracledb = require('../services/oracleDB');
const mongoDB = require('../services/mongoDB');
const {LoggerModule} = require('../services/logging');

const logger = LoggerModule.getLogger();

const importExportData = async  (collectionEnum, manad) => {
    try{
        logger.log('info', 'Month: '+manad+'. Getting '+collectionEnum+' data....' );
        let dbResult = await oracledb.getAllRecordsForAMonth(collectionEnum, manad);
        logger.log('info','Num records from relational database: '+dbResult.rows.length);
        await mongoDB.insertMongo(dbResult.rows, collectionEnum);
    } catch (err) {
        console.log('error', err);
    }
};

const import_all_monthData_for_a_Collection = async (collectionEnum) =>{
    try{
        //We will do MANAD search for each table
        let data = await oracledb.getMonadFromDB(collectionEnum);
        for(let index = 0 ; index<data.length; index++) {
            logger.log('info', `Sokandedata for manad: ${ data[index].MANAD }`);
            await importExportData(collectionEnum, data[index].MANAD);
        }
    } catch (err) {
        console.log('error', err);
    }
};

const import_All_MonthData_for_all_collections= async () => {
    try{
        logger.log('info','Import all month for collection: ');
        for(const collectionEnum in mongoDB.TableEnum){          
            await import_all_monthData_for_a_Collection(collectionEnum);
        }

    }catch (err) {
        console.log('info', err);
    }

}
//TODO: Compare OracleDB MANAD with MANAD in docDB (fetch or not fetch?)
const importNewMonth = () =>{
    //string to date
    //Get last month from mongodb
    //Check with OracleDB if there is a new year-month to import
}
//TODO: It is possibleIs to fill upp one collection and rename it to 'prod' collection (shorten the offline time)
module.exports = {
    importExportData,
    import_All_MonthData_for_all_collections

};