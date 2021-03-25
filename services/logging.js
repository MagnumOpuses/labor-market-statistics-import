
const { Logger } = require('mongodb');
const { createLogger, format, transports, startTimer }  = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = format;
class LoggerModule {
    static #logger;
    static #SingleModule;
    constructor(){
        if(!LoggerModule.#SingleModule){
        this.myFormat = printf(({ timestamp,level, message, label,service }) => {
            return `${timestamp} [${service}] [${label}] ${level}: ${message}`;
        });
        
        LoggerModule.#logger = createLogger({
            
            level: 'debug',
            format: combine(
                timestamp(),
                this.myFormat
              ),
            defaultMeta: { service: 'labor-market-statistics-import' },
            transports: [
                new transports.Console({format: format.json()}),
            ],
            exitOnError: false,
         });
         LoggerModule.#logger.exitOnError = false;
        }
        return LoggerModule.#SingleModule;
    }
    static  getLogger(){
        if(LoggerModule.#logger === undefined || LoggerModule.#logger == null){
             new LoggerModule();
        }
        return LoggerModule.#logger;
    }
 }
 module.exports = {
  LoggerModule
 }

 