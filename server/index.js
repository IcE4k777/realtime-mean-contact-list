/*global io*/

var express = require('express');
var mongojs = require('mongojs');
var mongoose = require('mongoose');
var db = mongojs('contactList', ['contactList']);
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var sharedsession = require('express-socket.io-session');
var session = require('express-session')({
        secret: "aliensAreAmongUs",
        resave: true,
        saveUninitialized: true
    });

app.use(express.static("../public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session);


// Connecting to MongoDB
mongoose.connect('mongodb://localhost/meanContactApp');
mongoose.connection.once('open', function(){
    
    console.log("mongodb connection open");
    
    //Loading all models into app.models for ease of access.
    app.models = require('./models/index');
});

var httpServer = http.Server(app);
httpServer.listen(process.env.PORT, function(){
    console.log("server listening on port " + process.env.PORT);
});


// Just playing around with socket.io. The latter implements realtime 
// socket access to the database as apposed utilizing REST. Pretty cool stuff!
// We could also still use REST architechture and utilize sockets to provide realtime updates back
// to the client. Depending on the application, performance results alone are worth just utilizing
// sockets if possible, where large amounts of hits to the rest API will show the socket advantage.
// This was meant to be a learning exercise. Lets all keep learning!!
io = require('socket.io').listen(httpServer);
io.use(sharedsession(session));
io.on('connection', function(socket){
    
    console.log("client connected");
    var Contact = app.models.contact;

    socket.on("post:contactList", function(data){
       var contact = new Contact(data);
       contact.save(function(err, result){
       });
    });
    
    socket.on("get:request:contactList", function(){
        Contact.find({}, function(err, contacts){
           console.log("CONTACT: " + contacts);
           io.sockets.emit("get:return:contactList", contacts);
        });
    });
    
    socket.on("edit:getContact",function(data){
        var id = data;
        Contact.findById(data, function(err, contact){
            socket.emit("edit:return:contact", contact);
        });
    });
    
    socket.on("put:contactList", function(data){
        var id = data._id;
        Contact.findById(id, function(err, contact){
           contact.name = data.name;
           contact.number = data.number;
           contact.email = data.email;
           contact.save(function(err){});
           
           io.sockets.emit("put:updated:contactList");
           
        });
    });

    socket.on("delete:contact", function(data){
        var id = data;
        Contact.findByIdAndRemove(id, function(err){});
    });
});