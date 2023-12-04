var express = require('express');
var router = express.Router();
var File = require('../models/file');
var multer  = require('multer');
const path = require('path');

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
});

// POST route to save google calendar file
router.post('/event', upload.single('document'), async (req, res) => {
  console.log(req.file)

  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newFile = new File({
      clubId: String(req.body.clubId),
      filename: uploadedFile.filename,
      originalname: uploadedFile.originalname,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
    });

    await newFile.save();

    return res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
