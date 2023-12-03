require('dotenv').config();
var express = require("express");
var path = require("path");
const session = require('express-session');
const cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
const {createProxyMiddleware} = require('http-proxy-middleware');
const MongoStore = require('connect-mongo');

// Routes
const authMiddleware = require('./middleware/authMiddleware');
var index = require("./routes/index");
var data = require("./routes/data");
var comment = require("./routes/comment");
var comments = require("./routes/comments");
var auth = require("./routes/auth");

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


var app = express();
var port = 8081;

var socket_io = require("socket.io");
var io = socket_io();
app.use(cors());


// Session
app.use(session({
	secret: "yaleclubs",
	// store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI}),
	saveUninitialized: false,
	resave: false
}));


app.use((req, res, next) => {
	console.log(req.url);
	if (req.url.startsWith('/login')) {
		next();
	}

	if (req.url.startsWith('/api/auth/redirect')) {
		next();
	}
  
	authMiddleware(req, res, next);
});

// Proxies
app.use((req, res, next) => {
	if (req.url.startsWith('/api')) {
		next();
	}
	
	console.log(req.url);
	createProxyMiddleware({
		target: 'http://localhost:8082',
		changeOrigin: true,
	})(req, res, next);
});


// Use on the deployment
// app.use(express.static(path.join(__dirname, "dist")));


// Views
app.set("views",  path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// Body parser MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Routes
app.use("/", index);
app.use("/api", data);
app.use("/api", comment);
app.use("/api", comments);
app.use("/api", auth);

// Server Listeners
io.listen(app.listen(port, function(){
	console.log("Server running on port", port);
}));

app.io = io.on("connection", function(socket){
	console.log("Socket connected: " + socket.id);
});