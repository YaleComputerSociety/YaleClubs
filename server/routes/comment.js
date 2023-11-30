var express = require("express");
var router = express.Router();
const Comment = require('../models/comment');

// POST route to add a comment
router.post("/comment", async (req, res) => {
  const { text, clubId } = req.body;

  try {
    const newComment = new Comment({ text, clubId: String(clubId) });
    await newComment.save();

    res.status(201).json({ message: 'Comment added successfully!' });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
