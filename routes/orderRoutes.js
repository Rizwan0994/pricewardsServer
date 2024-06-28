const express = require('express');
const router = express.Router();
const { getAllPendingOrders, getAllDeliveredOrders ,updateTrackingStatus,getRefundedPendingOrders} = require('../controllers/orderController');
const {refundOrder} = require('../controllers/paymentController');
// Routes for fetching pending and delivered orders
router.get('/pending', getAllPendingOrders);
router.get('/delivered', getAllDeliveredOrders);
router.put('/:id/tracking-status', updateTrackingStatus);
router.get('/refunded', getRefundedPendingOrders);
router.post('/refund', refundOrder);

module.exports = router;
