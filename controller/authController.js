import { error } from "console";
import usermodel from "../models/usermodel.js";

const User = require('../models/User');
const sendSMS = require('../utils/sendSMS');
const sendEmail = require('../utils/sendEmail');
export const registerController = async (req, res, next) => {
    // try{
    const { name, email, password } = req.body
    if (!name) {
        // return res.status(400).send({success:false,message:'please provide name'});
        next("name is require");
    }

    if (!email) {

        next("email is require");
    }

    if (!password) {
        next("Password is require");
    }

    const existinguser = await usermodel.findOne({ email });
    if (existinguser) {

        next("email already register please login");
        // return res.status(200).send({
        //     success:false,
        //     message:'email already register please login'
        // });
    }
    const user = await usermodel.create({ name, email, password });
    //JSON WEBtoken
    const token = user.createJWT();
     res.status(201).send({
        sucess: true,
        message: 'user create successfully',
        user: {
            name: user.name,
            lastname: user.lastName,
            email: user.email,
            location: user.location,

         },
        token
    });
    // }catch(error){
    //   next(error);
    // }
};




export const loginController = async (req, res, next) => {
   
        const { email, password } = req.body;

        if (!email || !password) {
            next("please provide all fields");
        }

        // **Fetch user and include password explicitly**
        const user = await usermodel.findOne({ email }).select("+password");

        if (!user) {
            next("Invalid Username or Password");
        }

        // **Check if password exists before comparing**
        if (!user.password) {
        next("invalid password");
        }
        // **Compare password**
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            next("invalid Username or Password");
        }

        // **Generate Token**
        const token = user.createJWT();

        // **Remove password from response**
        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "Login successful!",
            user: { name: user.name, email: user.email },
            token
        });

    
};
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP to mobile
exports.sendSMSCode = async (req, res) => {
  const { mobileNumber } = req.body;
  const user = await User.findOne({ mobileNumber });

  if (!user) return res.status(404).json({ success: false, message: 'Mobile number not registered' });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendSMS(mobileNumber, otp);
  res.json({ success: true, message: 'OTP sent to mobile' });
};

// 2. Verify mobile OTP
exports.verifySMSCode = async (req, res) => {
  const { mobileNumber, verificationCode } = req.body;
  const user = await User.findOne({ mobileNumber });

  if (!user || user.otp !== verificationCode || Date.now() > user.otpExpires)
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  res.json({ success: true, message: 'OTP verified' });
};

// 3. Reset password using mobile
exports.resetByMobile = async (req, res) => {
  const { mobileNumber, verificationCode, newPassword } = req.body;
  const user = await User.findOne({ mobileNumber });

  if (!user || user.otp !== verificationCode || Date.now() > user.otpExpires)
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
};

// 4. Send OTP via Email
exports.sendEmailCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ success: false, message: 'Email not found' });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  await sendEmail(email, 'OTP for Password Reset', `Your OTP is ${otp}`);
  res.json({ success: true, message: 'OTP sent to email' });
};

// 5. Reset password using Email
exports.resetByEmail = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== verificationCode || Date.now() > user.otpExpires)
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

  user.password = newPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
};



