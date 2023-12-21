// backend/routes/events.js

const express = require('express');
const axios = require('axios');
const ICAL = require('ical.js');
const router = express.Router();
const path = require('path');
const fs = require('fs/promises');

// Location
const jsonFilePath = path.join(__dirname, '../savedEvents.json');

// Extract Data
const extractEvents = (icalData) => {
  const jcalData = ICAL.parse(icalData);

  const vevents = jcalData[2].map((veventData) => {
    const uid = veventData[1].find((prop) => prop[0] === 'uid');
    const summary = veventData[1].find((prop) => prop[0] === 'summary');
    const description = veventData[1].find((prop) => prop[0] === 'description');
    const url = veventData[1].find((prop) => prop[0] === 'url');
    const dtstart = veventData[1].find((prop) => prop[0] === 'dtstart');
    const organizer = veventData[1].find((prop) => prop[0] === 'organizer');

    return {
      uid: uid ? uid[3] : '',
      summary: summary ? summary[3] : '',
      description: description ? description[3] : '',
      url: url ? url[3] : '',
      date: formatDate(dtstart ? dtstart[3] : '', 'date'),
      time: formatDate(dtstart ? dtstart[3] : '', 'time'),
      organizer: organizer ? organizer[3] : '',
    };
  });

  const currentDate = new Date();

  // Filter events based on the date condition
  const filteredEvents = vevents.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= currentDate;
  });

  return filteredEvents;
};

// Date Formatting
const formatDate = (dateString, type) => {
  const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

  const formattedDate = new Date(dateString);

  if (type === 'date') {
    return formattedDate.toLocaleDateString('en-US', dateOptions);
  } else if (type === 'time') {
    return formattedDate.toLocaleTimeString('en-US', timeOptions);
  }

  return '';
};

// Update JSON
const saveToJSONFile = async (data) => {
  try {
    await fs.writeFile(jsonFilePath, JSON.stringify([...data], null, 2));
    console.log('Data saved to file successfully');
  } catch (error) {
    console.error('Error saving data to file:', error);
  }
};

// Setter
router.get('/save-events', async (req, res) => {
  try {
    const icalUrl = 'https://yaleconnect.yale.edu/ical/ical_yale.ics';
    const response = await axios.get(icalUrl);
    const extractedTitles = extractEvents(response.data);
    console.log(extractedTitles);

    await saveToJSONFile(extractedTitles);

    res.json(extractedTitles);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Getter
router.get('/events', async (req, res) => {
  try {
      // Read the content
      const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      console.log(jsonData);
  
      // Send the JSON data
      res.json(jsonData);
  } catch (error) {
      console.error('Error reading savedData.json:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
