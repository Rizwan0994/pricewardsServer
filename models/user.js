const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,      
  profileName: String,
  address:String,
  description: String,                  
  email: { 
    type: String,
    unique: true
  },
  phoneNumber: String,
  password: {
    type: String,
    default: null
  },
  role: {
    type: String,
    default: 'user'
  },
  image: {
    type: String,
    default: 'https://github.com/shadcn.png'
  },
  verified: {
    type: Boolean,
    default: false
  },
  otp: String, 
  otpExpire: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  
});

module.exports = mongoose.model('User', UserSchema);