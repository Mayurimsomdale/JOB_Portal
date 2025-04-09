const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  mobileNumber: String,
  password: String,
  otp: String,
  otpExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
