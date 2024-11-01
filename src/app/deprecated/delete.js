const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.delete('/delete-club/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.session.user;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ userId });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const index = user.saved.indexOf(clubId);

    if (index === -1) {
        return res.status(400).json({ error: 'Club ID not found in user\'s saved clubs' });
    }

    user.saved.splice(index, 1);
    await user.save();

    res.status(200).json({ message: 'Club ID deleted successfully' });
  } catch (error) {
    console.error('Error deleting club ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
