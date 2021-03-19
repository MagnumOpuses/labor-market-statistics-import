const oracledb = require('oracledb');
const OracleConfig = require('../config/oracledb');

const startup = async () => {
    try {
        console.log('Initializing Oracle database module');
        await oracledb.createPool(OracleConfig.dbPool);
        console.log(OracleConfig.dumpConfig())
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
module.exports = {
    startup, executeSQLStatement, close
}