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
