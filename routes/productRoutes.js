const express = require('express');
const router =express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/user/products', productController.getUserProducts);
router.post('/approveProduct', productController.approveProduct);
router.post('/createCustomProduct', productController.createCustomProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;