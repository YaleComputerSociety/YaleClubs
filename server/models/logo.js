const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema({
    data: { type: Buffer }, // Binary data of the logo
    contentType: { type: String } // MIME type of the logo
});

const Logo = mongoose.model('Logo', logoSchema);
module.exports = Logo;
