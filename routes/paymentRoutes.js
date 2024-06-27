// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment
} = require('../controllers/paymentController');

router.route('/create-payment-intent')
  .post( createPaymentIntent);

router.route('/confirm-payment')
  .post(confirmPayment);

module.exports = router;
