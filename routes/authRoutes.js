import express from 'express';
import User from '../models/job_portal.js'; // ✅ Make sure this path is correct
const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.post('/forgot-password/send-sms-code', authController.sendSMSCode);
router.post('/forgot-password/verify-sms-code', authController.verifySMSCode);
router.post('/forgot-password/reset-by-mobile', authController.resetByMobile);

router.post('/forgot-password/send-email-code', authController.sendEmailCode);
router.post('/forgot-password/reset-by-email', authController.resetByEmail);

module.exports = router;

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Create a new user using 'User' instead of 'Register'
        const newUser = new User({ name, email, password });

        res.status(201).json({ message: "User registered successfully" });
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
});

export default router;
