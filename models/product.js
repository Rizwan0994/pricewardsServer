const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  imageUrl: [String],
  name: String,
  description: String,
  price: Number,
  size:[String],
  code: String,
  stock: Number,
  length: Number,
  width: Number,
  discount: Number,
  freeShipping: Boolean,
  seasonalCategory: String,
  fabricCategory: String,
  productGender: String,
  isApproved: { type: Boolean, default: false },
  sold: Number,
  category: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Product', ProductSchema);