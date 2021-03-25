const oracledb = require('./services/oracleDB');
const mongoDB = require('./services/mongoDB');
const importer = require('./control/import');
const { LoggerModule } = require('./services/logging');
const { stringMonthSorterHelp } = require('./sorter');

(async function () {
    try {
        const logger = LoggerModule.getLogger();
        logger.log({ level: 'info', message: ' Is there any records to import...?' });
        profiler = logger.startTimer();
        await oracledb.init();
        mongoDB.showConfig();
        let mostResentDateInOracle = null;
        for (const collectionEnum in mongoDB.TableEnum) {
            let dateStringList = [];
            dateStringList = await oracledb.getMonadFromDB(collectionEnum);//getting sorted arrary, last date is last?
            dateStringList.sort(stringMonthSorterHelp).reverse(); //now last date is first
            //compare
            if (dateStringList.length !== 0) {
                currentDate = new Date(dateStringList[0].MANAD)
                console.log("String: "+dateStringList[0]+ "  date: "+currentDate);
                if (mostResentDateInOracle === null || currentDate !== mostResentDateInOracle ) {
                    mostResentDateInOracle = new Date(dateStringList[0].MANAD);
                }
            }
        }

        console.log("most resent date is :"+ currentDate);

        //First check if there is any relevent collections
        // If not: import all
        //else:
        //get all 

        profiler.done({ level: 'info', message: 'Importing done.', service: 'labor-market-statistics-import' });

    } catch (e) {
        console.log(e);
    } finally {
        process.exit(0);
    }
})();