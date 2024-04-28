const express = require("express");
const multer = require('multer');
const router = express.Router();

const Club = require('../models/club');
const Logo = require("../models/logo");

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

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// POST route to upload logo
router.post("/uploadlogo", upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newLogo = new Logo({
            data: req.file.buffer,
            contentType: req.file.mimetype
        });

        const savedLogo = await newLogo.save();

        res.status(201).json({ message: 'Logo uploaded successfully', logo: savedLogo });
    } catch (error) {
        console.error('Error uploading logo:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
