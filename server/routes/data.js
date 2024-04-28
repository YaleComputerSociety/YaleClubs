// JSON Club Manager

const express = require('express');
const router = express.Router();
const fs = require('fs/promises');

const Club = require("../models/club");

// // Route the Club JSON Data File
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
        // Read the content
        const clubs = await Club.findById(req.params.id);
        // Send the JSON data
        res.json(clubs);
    } catch (error) {
        console.error('Error reading savedData.json:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router.get('/data/:id', async (req, res) => {
//     res.json({ message: "Endpoint hit successfully", id: req.params.id });
// });

// const express = require('express');
// const router = express.Router();
// const Club = require('../models/Club'); // Adjust the path according to your project structure



// Get club by ID
// router.get('/data', async (req, res) => {
//     try {
//         console.log('testing');
//         console.log(req.params);
//         const club = await Club.findById(req.params.id);
//         // if (!club) {
//         //     return res.status(404).json({ error: 'Club not found' });
//         // }
//         res.json(club);
//     } catch (error) {
//         console.error('Error fetching club:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// Cant have two types of REST request in same route
// TODO: change

// router.post('/data', async (req, res) => {
//     try {
//         const newData = req.body;
//
//         // Read the existing data from the file
//         const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
//         const existingData = JSON.parse(fileContent);
//
//         // Append the new data to the existing data
//         const updatedData = [...existingData, ...newData];
//
//         // Update JSON Data File
//         await fs.writeFile(jsonFilePath, JSON.stringify(updatedData, null, 2));
//         res.json({ message: 'Data updated successfully' });
//     } catch (error) {
//         console.error('Error updating data:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

module.exports = router;
