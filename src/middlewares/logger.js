import {format} from 'date-fns';
import { v5 as uuidv5 } from 'uuid';
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; 

const logEvents = async (message, logFileName)=>{
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}`
    const logItems = `${dateTime}\t${uuidv5(message,NAMESPACE)}\t${message}\n`;


    try {
        const logDirs = path.join(__dirname,'..','..','logs');
        try {
            await fsPromises.stat(logDirs)
        } catch (error) {
            if(error.code === 'ENOENT'){
                await fsPromises.mkdir(logDirs,{recursive:true})
            }else{
                throw error;
            }
        }
        const logFilePath= path.join(logDirs,logFileName)
        await fsPromises.appendFile(logFilePath,logItems);
    } catch (error) {
        console.log(error);
    }
}

const logger  = (req,res,next)=>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin || 'Unknown origin'}`,'reqLog.log');
    console.log(`${req.method} ${req.path}`);
    next();
}

export {logger,logEvents}