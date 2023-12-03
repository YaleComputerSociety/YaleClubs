const express = require("express");
const axios = require("axios")
const { XMLParser} = require("fast-xml-parser");

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
    console.log(1);
    await axios.get(get_ticket_validation_link(req.query.ticket))
    .then((resp) => {
        if (resp.data === undefined) {
            return res.status(400).send('Invalid response from CAS server');
        }
    
        const parser = new XMLParser();

        const results = parser.parse(resp.data);
        const userId = results['cas:serviceResponse']['cas:authenticationSuccess']['cas:user'];

        req.session.user = userId;
        console.log(userId);

        res.redirect('/');
    });
});

module.exports = router;