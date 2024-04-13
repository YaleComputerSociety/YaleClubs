const express = require("express");
const path = require("path");
require('dotenv').config();
const session = require('express-session');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const {createProxyMiddleware} = require('http-proxy-middleware');
const MongoStore = require('connect-mongo');
const http = require('http');
const history = require('connect-history-api-fallback');

const getRoutes = require('./router');

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

// Session
app.use(session({
	secret: "yaleclubs",
	saveUninitialized: false,
	resave: false,
	store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI}),
}));

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

app.use(getRoutes(express.Router()));

// Views
app.set("views",  path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// Body parser MW
app.use(bodyParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// allows for backwards and forwards navigation
app.use(history({verbose: true}))
app.use('/', express.static(path.join(__dirname, 'dist')));
app.use(express.urlencoded({extended: false}));

// Server Listener
server.listen(port, () => {
    console.log(`Server running on ${process.env.BASE_URL}:${port}`);
});

