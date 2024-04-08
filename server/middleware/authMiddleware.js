require('dotenv').config();

module.exports = function (req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect(`http://${process.env.BASE_URL}/login`);
    }
};
