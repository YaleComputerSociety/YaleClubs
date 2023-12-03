const express = require("express");
const router = express.Router();
const axios = require("axios")
const { XMLParser} = require("fast-xml-parser");

const CAS_SERVER = 'https://secure.its.yale.edu'
const CAS_VALIDATE_ROUTE = '/cas/serviceValidate'
const CAS_SERVICE = "http://localhost:8081/api/auth/redirect"

const get_ticket_validation_link = (ticket) => {
    const validateURL = new URL(CAS_VALIDATE_ROUTE, CAS_SERVER)
    validateURL.searchParams.append('ticket', ticket)
    validateURL.searchParams.append('service', CAS_SERVICE)
    return validateURL.toString()
}

router.get("/auth/redirect", async (req, res) => {
    const response = await axios.get(get_ticket_validation_link(req.query.ticket))
        .then((resp) => {
            if (resp.data === undefined) return;

            const parser = new XMLParser();

            let results = parser.parse(resp.data)
            let userId = results['cas:serviceResponse']['cas:authenticationSuccess']['cas:user']
            console.log(userId)
    })
});

module.exports = router;