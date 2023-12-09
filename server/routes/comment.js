var express = require("express");
var router = express.Router();
const Comment = require('../models/comment');
const axios = require("axios");
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const serverUrl = "https://yalies.io/api/people";

// POST route to add a comment
router.post("/comment", async (req, res) => {
  const { text, clubId, anonymous } = req.body;
  const userId = req.session.user;
  let name = "";

  const fetchUser = async (userId) => {
    try {
      const response = await axios.post(serverUrl, {
        filters: { netid: userId },
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      });
  
      if (response.status !== 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return response.data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }
  
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  try {
    if (!anonymous) {
      const user = await fetchUser(userId);
      let firstName = user[0].first_name || '';
      let lastName = user[0].last_name || '';
      name = (firstName && lastName) ? `${firstName} ${lastName}` : firstName || lastName || 'Anonymous';
    } else {
      name = "Anonymous";
    }

    const newComment = new Comment({ text, name: name, clubId: String(clubId) });
    await newComment.save();

    res.status(201).json({ message: 'Comment added successfully!' });
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
