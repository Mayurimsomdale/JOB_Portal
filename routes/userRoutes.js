import express from 'express'
import userAuth from '../middelwares/authmiddleware.js';
import { updateUsercontroller } from '../controller/usercontroller.js';

const router=express.Router()

router.put('/update-user',userAuth,updateUsercontroller);
export default router;