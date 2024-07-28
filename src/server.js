import express, { text } from 'express';
import { logger, logEvents } from './middlewares/logger.js';
import ErrorHandler from './middlewares/errorHandler.js';
import cors from 'cors';
import { corsoptions } from './config/corsOptions.js';
import connectDB from './db/connect.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(logger);
app.use(cors(corsoptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use('/', express.static("public"));
app.use(cookieParser());

//router import 
import userRouter from './routes/user.router.js';
import Roomrouter from './routes/room.router.js'
import EmployeeRouter from './routes/employee.router.js'

//router declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rooms', Roomrouter);
app.use('/api/v1/employee', EmployeeRouter);
// app.post('/api/v1/users/register',upload.single("avatar"), registerUser);



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
