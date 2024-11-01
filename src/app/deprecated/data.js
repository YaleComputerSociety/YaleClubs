// JSON Club Manager

const express = require('express');
const router = express.Router();
const fs = require('fs/promises');

const Club = require("../models/club");

// Route the Club JSON Data File
router.get('/data', async (req, res) => {
    try {
        // Read the content
        const clubs = await Club.find({});
        // Send the JSON data
        res.json(clubs);
    } catch (error) {
        console.error('Error reading savedData.json:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/data/:id', async (req, res) => {
    try {
        const clubId = req.params.id;
        if (clubId) {
            const club = await Club.findById(clubId);
            
            if (!club) {
                return res.status(404).json({ error: 'Club not found' });
            }
            
            res.json(club);
        }
    } catch (error) {
        console.error('Error fetching club data by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/data/by/:userid', async (req, res) => {
    try {
        const userId = req.params.userid;
        const clubs = await Club.find({ clubLeaders: userId });
        (clubs);

        if (!clubs || clubs.length === 0) {
            return res.status(404).json({ error: 'Clubs not found for the given user' });
        }

        res.json(clubs);
    } catch (error) {
        console.error('Error fetching clubs by user ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
