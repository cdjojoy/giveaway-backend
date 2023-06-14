const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 1,
    max: 255,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 1,
    max: 99999,
    required: true,
  },
  imageUrl: [
    {
    type: String,
    required: true,
    },
],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
