const oracledb = require('oracledb');
const OracleConfig = require('../config/oracledb');
const {LoggerModule} = require('../services/logging');

const logger = LoggerModule.getLogger();

const init = async () => {
    try {
        logger.log('info','Initializing Oracle database module');
        await oracledb.createPool(OracleConfig.dbPool);
        logger.log('info', OracleConfig.dumpConfig())
    } catch (err) {
        logger.log('error', err);
        process.exit(1); // Non-zero failure code
    }
};

const close = async () => {
    await oracledb.getPool().close();
};

const getMonadFromDB = async (collectionEnum) => {
    let bind = {};
    const sql = "select distinct MANAD from "+collectionEnum+" ORDER BY MANAD";
    logger.log('info', 'Fetch all months for table: '+collectionEnum);
    let dbResult = await executeSQLStatement(sql, bind);
    logger.log('info',`Rows from oracle database: ${JSON.stringify(dbResult.rows)}`);
    return JSON.parse(JSON.stringify(dbResult.rows));
};

const getAllRecordsForAMonth = async (collectionEnum, manad) => {
    let bind = { manad };
    let sql = "select * from "+collectionEnum+" where manad=:manad";
    let dbResult = await executeSQLStatement(sql, bind);
    return dbResult;
}


const executeSQLStatement = async (statement, binds = [], opts = {})  => {
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
                    logger.log('error', err);
                    throw err;
                }
            }
        }
    });
};
module.exports = {
    init, executeSQLStatement, getMonadFromDB, close, getAllRecordsForAMonth
}