const express = require('express');
const router =express.Router();
const userController = require('../controllers/authController')


router.post('/login',userController.loginUser)
router.post('/loginWithGoogle',userController.loginwithGoogle)
router.post('/register',userController.registerUser)
router.post('/forgotPassword', userController.forgotPassword);
router.post('/resendOtp', userController.resendOtp);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/resetPassword', userController.resetPassword);
router.post('/verfiyToken',userController.verfiyToken)
// router.post('/logout',userController.logoutUser)



module.exports = router;