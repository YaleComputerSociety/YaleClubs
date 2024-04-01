const express = require('express');
const router = express.Router();

const Club = require('../models/club');

router.post('/create', async (req, res) => {
    try {
        const newData = req.body;
        console.log(newData);
        const newClub = new Club(newData);
        await newClub.save();

        res.json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;