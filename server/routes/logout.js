const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) => {
    console.log(1);
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Session destroyed');
            res.setHeader('X-Reload-Page', 'true');
            res.status(200).send('Logout successful');
        }
    });
});

module.exports = router;
