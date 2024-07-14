import { logEvents } from "./logger.js";

const ErrorHandler = (err, req, res, next) => {
    logEvents(
        `${err.name}\t${err.message}\t${req.method}\t${req.url}\t${req.headers.origin || 'Unknown Origin'}`,
        "errLog.log"
    );
    console.log(err.stack);

    const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(status);
    res.json({ message: err.message });
};

export default ErrorHandler
