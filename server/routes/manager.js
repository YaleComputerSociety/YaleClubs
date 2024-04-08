const express = require('express');
const router = express.Router();

const multer = require('multer');
const mongoose = require('mongoose');

const Club = require('../models/club');
const Image = require('../models/image');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint to upload image
router.post('/uploadimage', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const newImage = new Image({
            data: req.file.buffer,
            contentType: req.file.mimetype
        });

        // Save the image to MongoDB
        await newImage.save();

        // Return the ID of the saved image
        res.json({ imageId: newImage._id });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


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