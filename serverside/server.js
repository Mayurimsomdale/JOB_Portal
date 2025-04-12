import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';


dotenv.config();

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));
  
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// Updated user schema to include mobile number and reset password fields
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobileNumber: { type: String }, // Added mobile number field
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationCode: String, // Added verification code field
  verificationCodeExpires: Date // Added expiration for verification code
});

const User = mongoose.model('User', userSchema);

// Register Endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, mobileNumber, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    
    // Optional: Check if mobile number is already in use
    if (mobileNumber) {
      const existingMobile = await User.findOne({ mobileNumber });
      if (existingMobile) return res.status(400).json({ message: "Mobile number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      name, 
      email, 
      mobileNumber,
      password: hashedPassword 
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

// Login Endpoints
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

app.post('/api/login-mobile', async (req, res) => {
  const { mobileNumber, password } = req.body;

  try {
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(400).json({ success: false, message: "Mobile number not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Mobile Login Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Send Email Verification Code
app.post('/api/forgot-password/send-email-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not registered in our system. Please check your email address.' 
      });
    }
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = Date.now() + 600000; // 10 minutes from now
    
    // Save the verification code to the user record
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = codeExpiry;
    await user.save();
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Email content
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USERNAME,
      subject: 'Password Reset Verification Code',
      text: `Your verification code to reset your password is: ${verificationCode}\n\n
        This code is valid for 10 minutes.\n
        If you did not request this code, please ignore this email and your password will remain unchanged.`
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Verification code sent to your email!' 
    });
  } catch (error) {
    console.error('Email verification code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending verification code. Please try again.' 
    });
  }
});

// Verify Email Verification Code
app.post('/api/forgot-password/verify-email-code', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    // Find user with the valid verification code that hasn't expired
    const user = await User.findOne({
      email,
      verificationCode,
      verificationCodeExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code.' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Verification code validated successfully.' 
    });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying code. Please try again.' 
    });
  }
});

// Reset Password using Email Verification
app.post('/api/forgot-password/reset-by-email', async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    
    // Find user with the valid verification code that hasn't expired
    const user = await User.findOne({
      email,
      verificationCode,
      verificationCodeExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code.' 
      });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password and remove verification code fields
    user.password = hashedPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password has been updated successfully!' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating password. Please try again.' 
    });
  }
});

// Original forgot password endpoint (still works but uses token instead of code)
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not registered in our system. Please check your email address.' 
      });
    }
    
    // Generate reset token and expiry (valid for 1 hour)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    
    // Save the reset token to the user record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Create email transporter
    async function testEmailConnection() {
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    
      try {
        // Verify connection
        await transporter.verify();
        console.log('Email connection successful!');
    
        // Send test email
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USERNAME,
          to: process.env.EMAIL_USERNAME, // Send to yourself as a test
          subject: 'Test Email from Node.js App',
          text: 'If you receive this email, your email configuration is working correctly!'
        });
    
        console.log('Test email sent: %s', info.messageId);
      } catch (error) {
        console.error('Email error:', error);
        console.log('\nTROUBLESHOOTING TIPS:');
        console.log('1. Make sure you\'re using an App Password, not your regular password');
        console.log('2. Confirm your Gmail account has 2-Step Verification enabled');
        console.log('3. Check that your .env file has the correct EMAIL_USERNAME and EMAIL_PASSWORD');
        console.log('4. Make sure less secure app access is turned off in your Google account');
      }
    }
    
    testEmailConnection();
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset email sent!' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing request. Please try again.' 
    });
  }
});

// Original reset password endpoint
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user with the valid token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password reset token is invalid or has expired.' 
      });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user's password and remove reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password has been updated successfully!' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating password. Please try again.' 
    });
  }
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));