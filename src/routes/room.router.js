import mongoose from "mongoose";
import express from 'express';

const Roomrouter=  express.Router();

Roomrouter.route('/user')
.get()

export default Roomrouter