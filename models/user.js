const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    min: 3,
    max: 60,
    required: true,
  },
  lastName: {
    type: String,
    min: 3,
    max: 60,
    required: true,
  },
  email: {
    type: String,
    min: 3,
    max: 252,
    required: true,
    unique: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  phone: {
    type: String,
    max: 32,
    required: true,

  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
