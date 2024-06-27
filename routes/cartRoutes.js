// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const {
  addToCart,
  removeFromCart,
  viewCart,
  updateCartItem,
  checkout
} = require('../controllers/cartController');

router.route('/')
  .get(viewCart)
  .post( addToCart)
  .put(updateCartItem)
  .delete(removeFromCart);

router.route('/checkout')
  .post( checkout);

module.exports = router;
