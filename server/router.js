const data = require("./routes/data");
// const events = require("./routes/event");
// const comment = require("./routes/comment");
// const comments = require("./routes/comments");
// const subscribe = require("./routes/subscribe");
const auth = require("./routes/auth");
const logout = require("./routes/logout");
const crm = require("./routes/create");
const save_club = require("./routes/save");
const delete_club = require("./routes/delete");

const PORT = process.env.PORT || 8081;
const BASE_URL = process.env.BASE_URL;

if (!BASE_URL) {
    console.error("Error: BASE_URL environment variable is not defined.");
    process.exit(1);
}

const loginCheck = async (req, res, next) => {
    let path = req.baseUrl + req.path
    if (path === '/login' || path === '/api/auth/redirect') {
        return next();
    }

    if (req.session && req.session.user) {
        return next();
    }

    return res.redirect(`http://${BASE_URL}:${PORT}/login`);
}

const getRoutes = (router) => {
    // restrict pages
    router.get('/', loginCheck);
    router.get('/crm', loginCheck);
    router.get('/clubs/*', loginCheck);

    router.use("/api", loginCheck, data);
    // router.use("/api", events);
    // router.get("/api", comment);
    // router.get("/api", comments);
    // router.get("/api", subscribe);

    router.use("/api", loginCheck, auth);
    router.use("/api", loginCheck, logout);

    router.use("/api", loginCheck, crm);
    router.use("/api", loginCheck, save_club);
    router.use("/api", loginCheck, delete_club);
    return router;
}

module.exports = getRoutes;