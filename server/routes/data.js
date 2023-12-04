// JSON Club Manager

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs/promises');

const jsonFilePath = path.join(__dirname, '../savedData.json');

// Route the Club JSON Data File
router.get('/data', async (req, res) => {
    try {
        // Read the content
        const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
    
        // Send the JSON data
        res.json(jsonData);
    } catch (error) {
        console.error('Error reading savedData.json:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Everythign from the JSON File
router.delete('/data', async (req, res) => {
    try {
        // Clear the file by writing an empty array
        await fs.writeFile(jsonFilePath, '[]');

        res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add to the End of the Club JSON Data File
router.post('/data', async (req, res) => {
    try {
        const newData = req.body;

        // Read the existing data from the file
        const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
        const existingData = JSON.parse(fileContent);

        // Append the new data to the existing data
        const updatedData = [...existingData, ...newData];

        // Update JSON Data File
        await fs.writeFile(jsonFilePath, JSON.stringify(updatedData, null, 2));
        res.json({ message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
