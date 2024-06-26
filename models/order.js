// models/order.js

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  shippingAddress: {
    address: { type: String},
    city: { type: String},
    postalCode: { type: String },
    country: { type: String}
  },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    updateTime: { type: String },
    emailAddress: { type: String }
  },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  trackingStatus: {
    type: String,
    enum: ['order confirmed', 'order shipped', 'out for delivery', 'delivered','refund processed'],
    default: 'order confirmed'
  },
  isRefunded: { type: Boolean, default: false },
  refundedAt: { type: Date },
  refundResult: {
    id: { type: String },
    status: { type: String },
    updateTime: { type: String }
  },
  isCustom: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
