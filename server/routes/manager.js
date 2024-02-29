const express = require('express');
const router = express.Router();

const Club = require('../models/club');

// app.get('/find', async (req, res) => {
//   // ... your existing code ...
// });

// app.delete('/delete', async (req, res) => {
//   // ... your existing code ...
// });

router.post('/create', async (req, res) => {
    try {
        const newData = req.body;
        const newClub = new Club(newData);
        await newClub.save();

        res.json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;