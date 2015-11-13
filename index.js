/*global io*/

var express = require('express');
var mongojs = require('mongojs');
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

 
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session);
 
var httpServer = http.Server(app);
httpServer.listen(process.env.PORT, function(){
    console.log("server listening on port " + process.env.PORT);
});

// app.get('/contactList', function(req,res){
//     console.log("Received a get request");
   
//     db.contactList.find(function(err, docs){
//         console.log(docs);
//         res.json(docs);
//     });
// });

// app.post('/contactList', function(req,res){
//     console.log("post: " + req.body);
//     db.contactList.insert(req.body, function(err, doc){
//       res.json(doc); 
//     });
// });

// app.delete('/contactList/:id', function(req,res){
//     var id = req.params.id;
//     console.log(id);
//     db.contactList.remove({_id: mongojs.ObjectId(id)}, function(err, doc){
//         res.json(doc);
//     });
// });

// app.get('/contactList/:id', function(req,res){
//     var id = req.params.id;
//     console.log("THIS IS FROM GET");
//     db.contactList.findOne({_id: mongojs.ObjectId(id)}, function(err, doc){
//       res.json(doc); 
//     });
// });

// app.put('/contactList/:id', function(req,res){
//     var id = req.params.id;
//     console.log(req.body.name);
//     db.contactList.findAndModify({query: {_id: mongojs.ObjectId(id)},
//     update: {$set: {name: req.body.name, email: req.body.email, number: req.body.number}},
//     new: true}, function(err, doc){
//         res.json(doc);
//     });
// });


// Just playing around with socket.io. The latter replaces the former with direct / realtime 
// socket access to the data base as apposed to rest style. Pretty cool stuff!
// We could also still use the former and utilize sockets to provide realtime updates back
// to the client. Depending on the application, performance results alone are worth
io = require('socket.io').listen(httpServer);
io.use(sharedsession(session));
io.on('connection', function(socket){
    
    console.log("client connected");

    socket.on("post:contactList", function(data){
        db.contactList.insert(data, function(err, doc){
        });
    });
    
    socket.on("get:request:contactList", function(){
        db.contactList.find(function(err, docs){
            io.sockets.emit("get:return:contactList", docs);
        });
    });
    
    socket.on("edit:getContact", function(data){
     var id = data;
        db.contactList.findOne({_id: mongojs.ObjectId(id)}, function(err, doc){
          socket.emit("edit:return:contact", doc);
        });
    });
    
    socket.on("put:contactList", function(data){
        var id = data._id
        db.contactList.findAndModify({query: {_id: mongojs.ObjectId(id)},
        update: {$set: {name: data.name, email: data.email, number: data.number}}, new: true}, function(err, doc){
        });
    });
    
    socket.on("delete:contact", function(data){
        var id = data
        db.contactList.remove({_id: mongojs.ObjectId(id)}, function(err, doc){});
    });
});