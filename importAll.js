const oracledb = require('./services/oracleDB');
const mongoDB = require('./services/mongoDB');
const importer = require('./control/import');
const {LoggerModule} = require('./services/logging');
/**
 * Import all records from all table, into MongoDB
 */
(async function() {
    try{
        const logger = LoggerModule.getLogger();
        logger.log({level: 'info',message:' Importing data starts...'});
        profiler = logger.startTimer();
        await oracledb.init();
        mongoDB.showConfig();
        await mongoDB.removeAllCollections();
        await importer.import_All_MonthData_for_all_collections();
        await mongoDB.create_Indexes_for_all_collections();
        profiler.done({level: 'info', message: 'Importing done.', service: 'labor-market-statistics-import' });
    
    }catch(e){
        console.log(e);
    }finally{
        process.exit(0);
    }
})();