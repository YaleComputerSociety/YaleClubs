
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  clubId: {
    type: String,
    required: true,
  },
  subc: {
    type: Array,
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
