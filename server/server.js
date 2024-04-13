const express = require("express");
const path = require("path");
require('dotenv').config();
const session = require('express-session');
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
const {createProxyMiddleware} = require('http-proxy-middleware');
const MongoStore = require('connect-mongo');
const http = require('http');
const history = require('connect-history-api-fallback');

// Routes
const authMiddleware = require('./middleware/authMiddleware');
const data = require("./routes/data");
const comment = require("./routes/comment");
const comments = require("./routes/comments");
const auth = require("./routes/auth");
const logout = require("./routes/logout");
const save_club = require("./routes/save");
const delete_club = require("./routes/delete");
const events = require("./routes/event");
const subscribe = require("./routes/subscribe");
const crm = require("./routes/manager");

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
	console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
	console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
	console.log('MongoDB disconnected');
});


const app = express();
const port = process.env.PORT || 8081;
const server = http.createServer(app);

app.use(cors());

// allows for backwards and forwards navigation
app.use(history({verbose: true}))
app.use('/', express.static(path.join(__dirname, 'dist')));
app.use(express.urlencoded({extended: false}));

// Session
app.use(session({
	secret: "yaleclubs",
	saveUninitialized: false,
	resave: false,
	store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI}),
}));

// Middleware
app.use((req, res, next) => {
	if (!req.url.startsWith('/api')) {
		authMiddleware(req, res, next);
    } else {
        next();
    }
});

// Proxies (Move Client to 8082)
if (process.env.DEV_ENV === 'true') {
    console.log("Dev mode enabled! Setting up proxy for expo")

    app.use((req, res, next) => {
        if (!req.url.startsWith('/api')) {
            createProxyMiddleware({
                target: 'http://localhost:8082/',
                changeOrigin: true,
            })(req, res, next);
        } else {
            next();
        }
    });
} else {
    console.log("Serer running on production.")
}

// Views
app.set("views",  path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// Body parser MW
app.use(bodyParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Routes
app.use("/api", data);
app.use("/api", events);
app.use("/api", comment);
app.use("/api", comments);
app.use("/api", subscribe);

app.use("/api", auth);
app.use("/api", logout);

app.use("/api", crm);
app.use("/api", save_club);
app.use("/api", delete_club);

// Server Listener
server.listen(port, () => {
    console.log(`Server running on ${process.env.BASE_URL}:${port}`);
});