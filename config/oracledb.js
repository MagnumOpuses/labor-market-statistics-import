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
    const configText = "Oracle Database Configuration:";
    copy = Object.assign({}, dbPool);
    copy.password = 'xxxxxxxxx';
    return configText+JSON.stringify(copy);
};



module.exports = {
    dbPool, dumpConfig
};
