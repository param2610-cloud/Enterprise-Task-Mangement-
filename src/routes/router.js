import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const router = express.Router();

//router import

import userRouter from './user.router.js';


router.get("^/$|/index(.html)?",(req,res)=>{
    
    res.sendFile(path.join(__dirname,'..','..','public','views','index.html'))
})


//router declaration
router.use('/users',userRouter);
router.use('/room',Roomrouter);


export default router;

