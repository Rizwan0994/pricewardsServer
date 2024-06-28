const asyncHandler = require('express-async-handler');
const Order = require('../models/order');

// Get all pending orders
const getAllPendingOrders = asyncHandler(async (req, res) => {
  try {

    const pendingOrders = await Order.find({ trackingStatus: { $ne: 'delivered' },isPaid:true }).populate('userId').populate({
        path: 'items.productId',
        model: 'Product'
      });
    res.status(200).json({ success: true, pendingOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all delivered orders
const getAllDeliveredOrders = asyncHandler(async (req, res) => {
  try {
    const deliveredOrders = await Order.find({ trackingStatus: 'delivered' ,  isRefunded: false, }).populate('userId').populate({
      path: 'items.productId',
      model: 'Product'
    });
    res.status(200).json({ success: true, deliveredOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Tracking Status
const updateTrackingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { trackingStatus } = req.body;
  
    try {
      const order = await Order.findById(id);
  
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
  
      order.trackingStatus = trackingStatus;
      await order.save();
  
      res.status(200).json({ success: true, order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  const getRefundedPendingOrders = asyncHandler(async (req, res) => {
    try {
        //  trackingStatus: { $ne: 'delivered' }
      const orders = await Order.find({ 
        isRefunded: true,  
      }).populate('userId').populate({
        path: 'items.productId',
        model: 'Product'
      });
      res.status(200).json({ success: true, orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

module.exports = {
  getAllPendingOrders,
  getAllDeliveredOrders,
  updateTrackingStatus,
  getRefundedPendingOrders
};
