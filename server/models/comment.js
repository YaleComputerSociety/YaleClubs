// models/comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  clubId: {
    type: String,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
