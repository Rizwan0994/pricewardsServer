// index.js
const express = require('express');
const router = express.Router();
// const userRoutes = require("../routes/userRoutes")
// const propertyRoutes = require("../routes/propertyRoutes")
const authRoutes = require("../routes/authRoutes")
// const contactRoutes = require("../routes/contactRoutes")
const { jwtValidation} = require('../middlewares/authentication');
// const propertyController = require('../controllers/propertyController');
// const userController = require('../controllers/userController');
const productRoutes = require('../routes/productRoutes');
const productController = require('../controllers/productController');
// const paymentRoutes = require('../routes/paymentRoutes');
// const product = require('../models/product');
router.use('/api/auth', authRoutes);

router.get('/api/product', productController.getAllProducts);
// router.use('/api/contact', contactRoutes);
// router.use('/api/payment', paymentRoutes);
router.use(jwtValidation);

router.use('/api/product',productRoutes);


router.get('/api', function (req, res) {
   res.send('Hello, pricewards Server =>  this is the main api route!');

});

module.exports = router;
