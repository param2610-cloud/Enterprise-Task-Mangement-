import express, { text } from 'express';
import { logger, logEvents } from './middlewares/logger.js';
import ErrorHandler from './middlewares/errorHandler.js';
import cors from 'cors';
import { corsoptions } from './config/corsOptions.js';
import connectDB from './db/connect.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(logger);
app.use(cors(corsoptions));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use('/', express.static(path.join(__dirname, "public")));
app.use(cookieParser());

//router import 
import router from './routes/router.js';

//router declaration
app.use('/api/v1', router);



app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname,'..', 'public', 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ message: '404 not found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(ErrorHandler);

mongoose.connection.once('open', () => {
    console.log('Connection Established');
    app.listen(port, () => {
        console.log(`Server is activated and running on port ${port}`);
    });
});

mongoose.connection.on('error', err => {
    console.error('Mongoose connection error:', err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});
