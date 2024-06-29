//over all pending...
// const asyncHandler = require('express-async-handler');
// const Order = require('../models/order');

// // Get all pending orders
// const getAllPendingOrders = asyncHandler(async (req, res) => {
//   try {
//  const userId = req.loginUser._id;
//     const pendingOrders = await Order.find({ trackingStatus: { $ne: 'delivered' },isPaid:true }).populate('userId').populate({
//         path: 'items.productId',
//         model: 'Product'
//       });
//     res.status(200).json({ success: true, pendingOrders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Get all delivered orders
// const getAllDeliveredOrders = asyncHandler(async (req, res) => {
//   try {
//     const deliveredOrders = await Order.find({ trackingStatus: 'delivered' ,  isRefunded: false, }).populate('userId').populate({
//       path: 'items.productId',
//       model: 'Product'
//     });
//     res.status(200).json({ success: true, deliveredOrders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Update Tracking Status
// const updateTrackingStatus = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const { trackingStatus } = req.body;
  
//     try {
//       const order = await Order.findById(id);
  
//       if (!order) {
//         return res.status(404).json({ success: false, message: 'Order not found' });
//       }
  
//       order.trackingStatus = trackingStatus;
//       await order.save();
  
//       res.status(200).json({ success: true, order });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   });

//   const getRefundedPendingOrders = asyncHandler(async (req, res) => {
//     try {
//         //  trackingStatus: { $ne: 'delivered' }
//       const orders = await Order.find({ 
//         isRefunded: true,  
//       }).populate('userId').populate({
//         path: 'items.productId',
//         model: 'Product'
//       });
//       res.status(200).json({ success: true, orders });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   });
  

// module.exports = {
//   getAllPendingOrders,
//   getAllDeliveredOrders,
//   updateTrackingStatus,
//   getRefundedPendingOrders
// };




const asyncHandler = require('express-async-handler');
const Order = require('../models/order');
const Product = require('../models/product');

// Get all pending orders for a specific owner's products
const getAllPendingOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.loginUser._id;

    // Find all products that belong to this owner
    const ownerProducts = await Product.find({ userId });
    
    // Extract the product IDs
    const productIds = ownerProducts.map(product => product._id);

    // Find all pending orders that contain these products
    const pendingOrders = await Order.find({ 
      trackingStatus: { $ne: 'delivered' },
      isPaid: true,
      'items.productId': { $in: productIds }
    }).populate('userId').populate({
      path: 'items.productId',
      model: 'Product'
    });

    res.status(200).json({ success: true, pendingOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all delivered orders for a specific owner's products
const getAllDeliveredOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.loginUser._id;

    // Find all products that belong to this owner
    const ownerProducts = await Product.find({ userId });

    // Extract the product IDs
    const productIds = ownerProducts.map(product => product._id);

    // Find all delivered orders that contain these products
    const deliveredOrders = await Order.find({ 
      trackingStatus: 'delivered',
      isRefunded: false,
      'items.productId': { $in: productIds }
    }).populate('userId').populate({
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

  if (trackingStatus === undefined || trackingStatus === '') {
    return res.status(400).json({ success: false, message: 'Invalid tracking status' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { trackingStatus: trackingStatus },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all refunded pending orders for a specific owner's products
const getRefundedPendingOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.loginUser._id;

    // Find all products that belong to this owner
    const ownerProducts = await Product.find({ userId });

    // Extract the product IDs
    const productIds = ownerProducts.map(product => product._id);

    // Find all refunded orders that contain these products
    const orders = await Order.find({ 
      isRefunded: true,
      'items.productId': { $in: productIds }
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
