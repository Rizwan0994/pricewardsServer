// index.js
const express = require('express');
const router = express.Router();
const authRoutes = require("../routes/authRoutes")
const { jwtValidation} = require('../middlewares/authentication');

const productRoutes = require('../routes/productRoutes');
const cartRoutes = require('../routes/cartRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const orderRoutes=require("../routes/orderRoutes")
const productController = require('../controllers/productController');


router.use('/api/auth', authRoutes);

router.get('/api/product', productController.getAllProducts);
 router.use('/api/product/getBestSellingProducts', productController.getBestSellingProducts);
 router.get('/api/product/:id', productController.getProduct); 
 router.get('/api/product/topProducts/:userId', productController.getUserBestSellingProducts);
                                                                                        
// router.use('/api/contact', contactRoutes);
// router.use('/api/payment', paymentRoutes);
router.use(jwtValidation);

router.use('/api/product',productRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/payment', paymentRoutes);
router.use('/api/orders',orderRoutes)



router.get('/api', function (req, res) {
   res.send('Hello, pricewards Server =>  this is the main api route!');

});

module.exports = router;
