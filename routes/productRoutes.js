const express = require('express');
const router =express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/:id', productController.getProduct);
router.get('/', productController.getAllProducts);
router.get('/user/products', productController.getUserProducts);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;