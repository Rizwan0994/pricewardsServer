const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const UserModel = require("../models/user");
const bcrypt = require("bcrypt");

const { sendEmailWithAttachment, sendForgotPasswordEmail ,sendVerificationEmail} = require("../utils/Email");
const { decodeToken } = require("../middlewares/authentication");


const loginUser = asyncHandler(async (req, res) => {
  const userCredentials = req.body;

  const userEmail = userCredentials.email;
  const userPassword = userCredentials.password;
  if (!userEmail || !userPassword) {
    res.status(400).json({success:false, message: "All fields are required" });
    return;
  }

  // Find the user by email
  const userVar = await UserModel.findOne({ email: userEmail });

  if (!userVar) {
    // User not found
    res.status(401).json({success:false, message: "Invalid email or password" });
    return;
  }
  //check if user verified or not
  if (!userVar.verified) {
    return res.status(400).json({success:false, message: "User not verified" });
  }

  // Compare passwords
  const isPasswordMatch = await bcrypt.compare(userPassword, userVar.password);
  //check if password match or not
  if (!isPasswordMatch) {
    return res.status(401).json({success:false, message: "Invalid email or password" });
  }
  const token = await generateToken(res, userVar.id);
  const userResponse = {
    email: userVar.email,
    firstName: userVar.firstName,
    lastName: userVar.lastName,
    profileName: userVar.profileName,
    phoneNumber: userVar.phoneNumber,
    role: userVar.role,
    image: userVar.image,
    token: token,
  };

  // Passwords match, login successful
  res.status(200).json({ success:true ,message: "Login successful",  user: userResponse });
});

//otp verification 
const registerUser = async (req, res) => {
  const { firstName, lastName, profileName, email, phoneNumber, password, role, image } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email });

    if (existingUser && !existingUser.verified) {
      // Generate a 5-digit OTP
      const otp = Math.floor(10000 + Math.random() * 90000).toString();

      existingUser.otp = otp;
      existingUser.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
      await existingUser.save();

      await sendVerificationEmail(existingUser.email, otp);
      return res
        .status(200)
        .json({ success: true, message: "User already Exits, Just Need Verification, Check Email!", redirectTo: "verifyOtp" ,email});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const obj = {
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      profileName: profileName,
      phoneNumber: phoneNumber,
      role: role,
      image: image,
      verified: false,
    }
    const newUser = await UserModel.create(obj);
      
    if (newUser) {
      const otp = Math.floor(10000 + Math.random() * 90000).toString();

      newUser.otp = otp;
      newUser.otpExpire = Date.now() + 300000;
      await newUser.save();
      await sendVerificationEmail(newUser.email, otp);
      res
        .status(201)
        .json({ success: true, message: "Please Check Your Email for Verification" ,email});
    } else {
      res
        .status(201)
        .json({ success: false, message: "Error Sending Email for Verification" });
    }
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};






//forgot password..........
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  // Generate a 5-digit OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  user.otp = otp;
  user.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
  await user.save();

  await sendForgotPasswordEmail(user.email, otp);

  res.status(200).json({ success: true, message: 'OTP sent to email' ,email});
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  const otp = Math.floor(10000 + Math.random() * 90000).toString();

  user.otp = otp;
  user.otpExpire = Date.now() + 300000; // OTP expires after 5 minutes
  await user.save();

  await sendForgotPasswordEmail(user.email, otp);

  res.status(200).json({ success: true, message: 'New OTP sent to email' });
};

const verifyOtp = async (req, res) => {
  const { otp, email } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ success: false, message: 'OTP is invalid' });
  }

  if (Date.now() > user.otpExpire) {
    return res.status(400).json({ success: false, message: 'OTP has expired' });
  }

  user.otp = null;
  user.otpExpire = null;
  user.verified = true;  //for signup scenerio
  await user.save();

  const userData = {  //for signup scenerio
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profileName: user.profileName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    image: user.image,
  };
  const token = await generateToken(res, userData.id);  //for signup scenerio
  res.status(200).json({success:true, message: 'OTP Verified', token, user: userData });
};

const resetPassword = async (req, res) => {
  const { password, confirmPassword, email } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Account not found' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.otp = null;
  user.otpExpire = null;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successfully' });
};



const loginwithGoogle = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "User data are required!" });
  }

  const isEmailExists = await UserModel.findOne({ email });
  if (isEmailExists) {
    return res.status(200).send({ message: "Login Successful!", user: isEmailExists });
  }

  res.status(404).json({ message: "notFound!" });
}

const verfiyToken = async (req, res) => {
  try {
      const token = req.headers["x-access-token"];
      const data = decodeToken(token)
     
      const findUser = await UserModel.findOne({ id: data.userId, isDeleted: false, verified: true });

      if (!findUser) {
        return res.status(400).send({ success:false,message: "Token Invalid." });
      }
      return res.status(200).send({ user: {...findUser}, message: "Token Valid.",success:true });
  } catch (error) {
      throw error;
  }
}



module.exports = {
    loginUser,
    registerUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    resendOtp,

    verfiyToken,
    loginwithGoogle,
  
  };
  