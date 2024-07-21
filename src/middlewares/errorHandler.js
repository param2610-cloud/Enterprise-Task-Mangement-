
import { logEvents } from '../middlewares/logger.js';
import { ApiError } from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
    
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
          success: err.success,
          message: err.message,
          errors: err.errors,
          data: err.data,
        });
      }
      logEvents(`${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin || 'Unknown Origin'}`, "errLog.log");
    
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
};

export default errorHandler;