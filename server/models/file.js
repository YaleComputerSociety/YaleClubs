const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  clubId: String,
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
