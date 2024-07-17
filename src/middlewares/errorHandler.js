
import { logEvents } from '../middlewares/logger.js';

const errorHandler = (err, req, res, next) => {
    
    logEvents(`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin || 'Unknown Origin'}`, "errLog.log");
    
    
    const status = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(status);
    
    
    res.json({ message: err.message });
};

export default errorHandler;