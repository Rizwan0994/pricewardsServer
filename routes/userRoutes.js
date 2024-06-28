const express = require('express');
const router =express.Router();
const userController = require('../controllers/userController')
//const protect =require('../middlewares/authMiddleware')

router.route('/resetProfilePassword').post(userController.resetProfilePassword)
router.route('/profile').put(userController.updateUserProfile).delete(userController.deleteUserProfile)
router.route('/addOrUpdateAgency').post(userController.addOrUpdateAgency)
router.route('/getUserAgency').get(userController.getUserAgency)





module.exports = router;