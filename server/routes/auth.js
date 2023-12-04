const express = require("express");
const axios = require("axios")
const { XMLParser} = require("fast-xml-parser");
const User = require("../models/user");

const router = express.Router();

const CAS_SERVER = 'https://secure.its.yale.edu';
const CAS_VALIDATE_ROUTE = '/cas/serviceValidate';
const CAS_SERVICE = "http://localhost:8081/api/auth/redirect";

const get_ticket_validation_link = (ticket) => {
    const validateURL = new URL(CAS_VALIDATE_ROUTE, CAS_SERVER)
    validateURL.searchParams.append('ticket', ticket)
    validateURL.searchParams.append('service', CAS_SERVICE)
    return validateURL.toString()
}

router.get('/auth/redirect', async (req, res) => {
    try {
        const casResponse = await axios.get(get_ticket_validation_link(req.query.ticket));
    
        if (casResponse.data === undefined) {
            return res.status(400).send('Invalid response from CAS server');
        }
    
        const parser = new XMLParser();
        const results = parser.parse(casResponse.data);
        const userId = results['cas:serviceResponse']['cas:authenticationSuccess']['cas:user'];
    
        // Check if the user is already in MongoDB
        const existingUser = await User.findOne({ userId });
    
        if (!existingUser) {
            // Save the user to MongoDB if not already present
            const newUser = new User({ userId });
            await newUser.save();
            console.log(`User ${userId} saved to MongoDB`);
        }
    
        req.session.user = userId;
        req.session.redirected = true;
        res.redirect('http://localhost:8081/');
    } catch (error) {
        console.error('Error in CAS redirection:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;