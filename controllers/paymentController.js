// controllers/paymentController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/order');
const Product = require('../models/product');
const asyncHandler = require('express-async-handler');

// Create Payment Intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // amount in cents
    currency: 'usd',
    metadata: { orderId: order._id.toString() }
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret
  });
});

// Confirm Payment
const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findById(paymentIntent.metadata.orderId);
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: paymentIntent.created,
        emailAddress: paymentIntent.receipt_email
      };

      order.trackingStatus = 'order confirmed';

      await order.save();

      res.status(200).json({ success: true,message: 'Payment  successful', order });
    } else {
       // Revert stock
       const order = await Order.findById(paymentIntent.metadata.orderId);
       for (const item of order.items) {
         const product = await Product.findById(item.productId);
         product.stock += item.quantity;
         await product.save();
       }
      res.status(400).json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process refund
const refundOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!order.isPaid) {
    return res.status(400).json({ success: false, message: 'Order is not paid, cannot process refund' });
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentResult.id,
      amount: Math.round(order.totalPrice * 100), // amount in cents
    });

    if (refund.status === 'succeeded') {
      order.isRefunded = true;
      order.refundedAt = Date.now();
      order.refundResult = {
        id: refund.id,
        status: refund.status,
        updateTime: refund.created,
      };

      // Revert stock
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        product.stock += item.quantity;
        await product.save();
      }
       order.trackingStatus = 'refund processed';

      await order.save();

      res.status(200).json({ success: true, order });
    } else {
      res.status(400).json({ success: false, message: 'Refund not successful' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = {
  createPaymentIntent,
  confirmPayment,
  refundOrder
};
