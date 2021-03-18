require('dotenv').config();

module.exports = {
    dbPool: {
        user: process.env.NODE_ORACLEDB_USER,
        // Get the password from the environment variable
        password: process.env.NODE_ORACLEDB_PASSWORD,
        connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
        poolMin: 10,
        poolMax: 10,
        poolIncrement: 0
    }
};
