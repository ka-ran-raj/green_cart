const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
  orderId: Number,
  username: String,
  phone: String,
  address: String,
  plantName: String,
  quantity: Number,
  totalAmount: Number,
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD'
  },
  paymentId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipping Out', 'Confirmed', 'Delivered'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
