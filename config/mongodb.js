require('dotenv').config();

const config=
    {
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
        port: process.env.MONGO_PORT,
        host: process.env.MONGO_HOST,
        db_name: process.env.MONGO_DB_NAME,
        default_uri: "mongodb://"+process.env.MONGO_USER+":"+process.env.MONGO_PASSWORD+"@"+ process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DB_NAME,
    }

dumpConfig = () =>{
    const configText = "Mongo Configuration:\n";
    return configText+JSON.stringify(config, null, 2);
};


module.exports = {
    config,
    dumpConfig
};
