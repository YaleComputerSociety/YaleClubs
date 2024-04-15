const data = require("./routes/data");
const events = require("./routes/event");
const comment = require("./routes/comment");
const comments = require("./routes/comments");
const subscribe = require("./routes/subscribe");
const auth = require("./routes/auth");
const logout = require("./routes/logout");
const crm = require("./routes/create");
const save_club = require("./routes/save");
const delete_club = require("./routes/delete");

const getRoutes = (router) => {
    // do a blanket barrier on all routes except login

    router.get('/', async (req, res, next) => {
        if (req.session && req.session.user) {
            next();
        } else {
            res.redirect(`http://${process.env.BASE_URL}:${process.env.PORT}/login`);
        }
    });

    router.use("/api", data);
    // router.use("/api", events);
    // router.get("/api", comment);
    // router.get("/api", comments);
    // router.get("/api", subscribe);

    router.use("/api", auth);
    // router.get("/api", logout);

    router.use("/api", crm);
    router.use("/api", save_club);
    router.use("/api", delete_club);

    return router;
}

module.exports = getRoutes;