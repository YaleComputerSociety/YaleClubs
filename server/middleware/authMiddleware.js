
module.exports = function(req, res, next) {
    console.log(req.session.user);
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('http://localhost:8082/login');
    }
};
