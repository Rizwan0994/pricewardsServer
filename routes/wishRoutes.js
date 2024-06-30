const express = require('express');
const router =express.Router();
const productController = require('../controllers/productController');



router.post('/addToWishlist', productController.addToWishlist);
router.get('/wishlist', productController.getWishlist);


module.exports = router;