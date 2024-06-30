const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  chest: Number,
  waist: Number,
  neck: Number,
  hips: Number,
  sleeve: Number,
  shoulder: Number,
  inseam: Number
});

module.exports = mongoose.model('Measurement', MeasurementSchema);