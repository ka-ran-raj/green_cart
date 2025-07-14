const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  category: String,
  stock: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Plant', plantSchema);