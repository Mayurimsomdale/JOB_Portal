import express from 'express'
import { testPostController } from '../controller/controller.js';
import userAuth from './../middelwares/authmiddleware.js';

//routes object

const router = express.Router();

router.post('/test-post',userAuth,testPostController);

export default router;