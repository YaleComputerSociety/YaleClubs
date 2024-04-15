const express = require('express');
const router = express.Router();

const Club = require('../models/club');

router.post('/create', async (req, res) => {
    try {
        const newData = req.body;
        console.log("create")
        console.log(newData)
        const newClub = new Club(newData);
        const result = await newClub.save();

        if (result === newClub) {
            res.json({success: true});
        } else {
            res.json({success: false, error: result});
        }

    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;