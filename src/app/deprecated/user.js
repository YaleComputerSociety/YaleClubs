
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  saved: {
    type: Array,
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
