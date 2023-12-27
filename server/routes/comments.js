const express = require("express");
const router = express.Router();
const Comment = require('../models/comment');

// POST route to get all comments
router.post("/comments", async (req, res) => {
  try {
      const { clubId } = req.body;

      if (!clubId) {
          return res.status(400).json({ message: 'clubId is required' });
      }

      const comments = await Comment.find({ clubId: String(clubId) });

      // Send the comments as a JSON response
      res.status(200).json(comments);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
