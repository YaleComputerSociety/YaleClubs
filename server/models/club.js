const mongoose = require('mongoose');
const logoSchema = require('./logo');

// Scheme for each Club Data
const clubSchema = new mongoose.Schema({
  clubName: { type: String },
  description: { type: String },
  instagram: { type: String },
  email: { type: String },
  website: { type: String },
  yaleConnect: { type: String },
  clubMembers: { type: [String] },
  clubLeaders: { type: [String] },

  // Reference to the Logo schema
  logo: { type: mongoose.Schema.Types.ObjectId, ref: 'Logo' }
});

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;
