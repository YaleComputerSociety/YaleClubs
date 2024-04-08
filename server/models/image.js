// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    data: {
        // Buffer type to store binary data
        type: Buffer,
        required: true
    },
    contentType: {
        // Mime type of the image (e.g., 'image/jpeg')
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;