require('dotenv').config();

const config=
    {
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
        port: process.env.MONGO_PORT,
        host: process.env.MONGO_HOST,
        defaultCollection: process.env.MONGO_DEFAULT_COLLECTION,
        default_uri: "mongodb://"+process.env.MONGO_USER+":"+process.env.MONGO_PASSWORD+"@"+ process.env.MONGO_HOST + ":" + process.env.MONGO_PORT + "/" + process.env.MONGO_DEFAULT_COLLECTION,
        api_url: process.env.SWAGGER_API_URL, //TODO: This shouldn't be here
    }

dumpConfig = () =>{
    const configText = "Mongo Configuration:\n";
    return configText+JSON.stringify(config, null, 2);
};

module.exports = {
    config,
    dumpConfig
    //uri: 'mongodb://statuser:kalle123@mongodb:27017/statistik'
};
