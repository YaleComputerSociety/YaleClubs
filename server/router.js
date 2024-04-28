const data = require("./routes/data");
// const events = require("./routes/event");
// const comment = require("./routes/comment");
// const comments = require("./routes/comments");
// const subscribe = require("./routes/subscribe");
const auth = require("./routes/auth");
const logout = require("./routes/logout");
const crmmanager = require("./routes/crmmanager");
const save_club = require("./routes/save");
const delete_club = require("./routes/delete");

const PORT = process.env.PORT || 8081;
const BASE_URL = process.env.BASE_URL;

if (!BASE_URL) {
    console.error("Error: BASE_URL environment variable is not defined.");
    process.exit(1);
}

const getRoutes = (router) => {
    // Do a blanket barrier on all routes except login

    router.get('/', async (req, res, next) => {
        if (req.session && req.session.user) {
            next();
        } else {
            res.redirect(`http://${BASE_URL}:${PORT}/login`);
        }
    });

    router.use("/api", data);
    // router.use("/api", events);
    // router.get("/api", comment);
    // router.get("/api", comments);
    // router.get("/api", subscribe);

    router.use("/api", auth);
    router.use("/api", logout);

    router.use("/api", crmmanager);
    router.use("/api", save_club);
    router.use("/api", delete_club);

    return router;
}

module.exports = getRoutes;