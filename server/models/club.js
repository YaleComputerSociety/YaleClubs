const mongoose = require('mongoose');

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
  logo: { type: String }
});

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;
