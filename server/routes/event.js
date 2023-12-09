const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
});

// POST route to save Google Calendar file
router.post('/event', upload.single('file'), async (req, res) => {
  try {
    console.log(req.file || req.body.document);
    const uploadedFile = req.file || req.body.document;
    
    // Commented for DEMO

    // Parse the ICS file content
    // const fileContent = uploadedFile.buffer.toString('utf-8');
    // const jcalData = ICAL.parse(fileContent);
    // const comp = new ICAL.Component(jcalData);
    // const vevents = comp.getAllProperties('vevent');

    // // Extract relevant information from vevents
    // const parsedEvents = vevents.map(vevent => {
    //   return {
    //     summary: vevent.getFirstPropertyValue('summary'),
    //     description: vevent.getFirstPropertyValue('description'),
    //     start: vevent.getFirstPropertyValue('dtstart').toJSDate(),
    //     end: vevent.getFirstPropertyValue('dtend').toJSDate(),
    //   };
    // });

    // // Read existing events data from the JSON file
    // const existingEventsData = await fs.readFile(eventsDataFilePath, 'utf-8');
    // const existingData = JSON.parse(existingEventsData);

    // // Append the parsed events to the existing data
    // const updatedData = [...existingData, ...parsedEvents];

    // // Update the events data JSON file
    // await fs.writeFile(eventsDataFilePath, JSON.stringify(updatedData, null, 2));

    // Save file information to MongoDB (assuming you are using MongoDB)
    // const newFile = new File({
    //   clubId: String(req.body.clubId),
    //   filename: uploadedFile.filename,
    //   originalname: uploadedFile.originalname,
    //   mimetype: uploadedFile.mimetype,
    //   size: uploadedFile.size,
    // });

    // await newFile.save();

    return res.status(200).json({ message: 'File uploaded and parsed successfully.' });
  } catch (error) {
    console.error('Error uploading and parsing file:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
