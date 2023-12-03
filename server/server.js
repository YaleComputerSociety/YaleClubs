require('dotenv').config();
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var index = require("./routes/index");
var data = require("./routes/data");
var auth = require("./routes/auth");
const cors = require('cors');
const mongoose = require('mongoose');

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

var index = require("./routes/index");
var data = require("./routes/data");
var comment = require("./routes/comment");
var comments = require("./routes/comments");

var app = express();

var port = 8081;

var socket_io = require("socket.io");

var io = socket_io();
app.use(cors());

//views

app.set("views",  path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

//Body parser MW

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//Routes

app.use("/", index);
app.use("/api", data);
app.use("/api", comment);
app.use("/api", comments);
app.use("/api", auth);


io.listen(app.listen(port, function(){
	console.log("Server running on port", port);
}));

app.io = io.on("connection", function(socket){
	console.log("Socket connected: " + socket.id);
});