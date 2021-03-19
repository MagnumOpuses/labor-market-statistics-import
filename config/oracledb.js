require('dotenv').config();

dbPool =  {
    user: process.env.NODE_ORACLEDB_USER,
    // Get the password from the environment variable
    password: process.env.NODE_ORACLEDB_PASSWORD,
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
}


dumpConfig = () =>{
    const configText = "Oracle Database Configuration:\n";
    return configText+JSON.stringify(dbPool, null, 2);
};



module.exports = {
    dbPool, dumpConfig
};
