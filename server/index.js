/*global io*/
/*global morgan*/

var _ = require('lodash');
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
var jwt = require('jsonwebtoken');
//var socketioJwt = require('socketio-jwt');
var morgan = require('morgan');
var config = require('./config/config.js');


app.use(express.static("../public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session);
app.set('secretSignature', config.secretSig);
app.use(morgan('dev'));


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


app.post('/checkUsername', function(req,res){
   
  console.log("testing request: " + req.body.inputValue)
  
  var User = app.models.user;
   
    User.findOne({normalizedUsername: req.body.inputValue.toLowerCase()}, function(err, user){
        if(user)
        {
            console.log("user found");
            res.json({'status':'200'})
        }
        
        if(!user)
        {
            console.log("user not found");
            res.json({'status':'204'})
        }
    });
});

app.post('/checkEmail', function(req,res){
   
  console.log("testing request: " + req.body.inputValue)
  
  var User = app.models.user;
   
    User.findOne({normalizedEmail: req.body.inputValue.toLowerCase()}, function(err, user){
        if(user)
        {
            console.log("email found");
            res.json({'status':'200'})
        }
        
        if(!user)
        {
            console.log("email not found");
            res.json({'status':'204'})
        }
    });
});

///// Authenticating user and returning JWT, JSON Web Token /////
app.post('/authenticate', function(req,res){
    
    var User = app.models.user;
    
    User.findOne({username: req.body.username}, function(err, user){
        
        if(!user)
        {
            res.json({success: false, message: 'username'});
        }
    
        if(user)
        {
            user.comparePassword(req.body.password, function(err, isMatch){
                
                if(isMatch)
                {
                  var token = jwt.sign({'userID': user._id, 'name': user.name, 'username': user.username}, app.get('secretSignature'), {expiresIn:86400}); //Token expires in 24 hours
                  res.json({success: true, message: 'Authentication Success', token: token});
                }
                
                if(!isMatch)
                {
                  res.json({success: false, message: 'password'});
                }
            });
        }
    });
    
    console.log("POST REQUEST" + JSON.stringify(req.body.password));
});

///// Creating User /////

app.post('/createUser', function(req,res){
    
    var newUser = req.body;
    
    newUser.normalizedName = req.body.name.toLowerCase();
    newUser.normalizedEmail = req.body.email.toLowerCase();
    newUser.normalizedUsername = req.body.username.toLowerCase();
    
    console.log("RECEIVED A USER CREATION REQUEST" + JSON.stringify(newUser));
    
    var User = app.models.user;
    var user = new User(newUser);
    
    user.save(function(err){
      if(err)
      {
          res.json({'status' : '204'})
      }
      
      if(!err)
      {
          res.json({'status' : '200'})
      }
      
     });
});

// Just playing around with socket.io. The latter implements realtime 
// socket access to the database as apposed utilizing REST. Pretty cool stuff!
// We could also still use REST architechture and utilize sockets to provide realtime updates back
// to the client. Depending on the application, performance results alone are worth just utilizing
// sockets if possible, where large amounts of hits to the rest API will show the socket advantage.
// This was meant to be a learning exercise. Lets all keep learning!!


// Update on the socket stuff here. We are now authenticating over the socket with the JWT 
// recieved from authenticating at the login prompt. After getting up to speed on some of the 
// security aspects with sockets / socket.io, it became clear that using JWT seemed to be a natural fit here.
// A lot of articles I came across showed the JWT token sent via the query string. The better and more secure approach
// would be allow the client to create the connection and then force an authentication message, where the token is then
// sent over for authentication. If an authentication message is not sent from the client with a valid token,
// then the socket is disconected. This approach was referecned from (modifed to my needs for storing connected clients in DB etc...):

// "facundoolano" (https://facundoolano.wordpress.com/2014/10/11/better-authentication-for-socket-io-no-query-strings/)

// I will probably end up making my own custom module / package out of this, as it would also be nice generate a seperate
// namespace for each client for added security. Hence, if for some reason a session was compromised, only stuff within that
// namespace would be seen, and not the entire namespace by default.


io = require('socket.io').listen(httpServer);
io.use(sharedsession(session));
io.on('connection', function(socket){
    
    var Contact = app.models.contact;
    var ConnectedClients = app.models.connectedClients;
    
    socket.auth = false;
   
    _.each(io.nsps, function(nsp){
        nsp.on('connect', function(socket){
            if (!socket.auth) 
            {
              console.log("removing socket from", nsp.name)
              delete nsp.connected[socket.id];
            }
        });
    });
    
    socket.on('authenticate', function(token){
   
        console.log("AUTH MESSAGE RECEIVED" + JSON.stringify(token));
        
        jwt.verify(token, app.get('secretSignature'), function(err, decoded){
          
            if(decoded)
            {
                console.log("token is valid");
                var decodedToken = jwt.decode(token, {json: true});
                var clientUsername = decodedToken.username;
               // var ConnectedClients = app.models.connectedClients;
                var connectedClient = new ConnectedClients({'socketID' : socket.id, 'username': clientUsername});
                
                connectedClient.save(function(err){
                      if(err)
                      {
                          console.log("CONNECTED CLIENT NOT SAVED: " + err);
                      }
                      
                      if(!err)
                      {
                          console.log("CONNECTED CLIENT SAVED");
                      }
                 });
                 
                socket.auth = true;
              
                _.each(io.nsps, function(nsp) {
                    if(_.findWhere(nsp.sockets, {id: socket.id})) 
                    {
                      console.log("restoring socket to", nsp.name);
                      nsp.connected[socket.id] = socket;
                    }
                });
                
                
                ConnectedClients.find({}, function(err, connectedClients){
                    if(!err)
                    {
                        console.log("CONNECTED CLIENTS: " + connectedClients);
                        io.sockets.emit('connectedClientsUpdate', connectedClients);
                    }
                });
            }
        });
    });
    
    setTimeout(function(){
        if (!socket.auth)
        {
          console.log("Disconnecting socket ", socket.id);
          socket.disconnect('unauthorized');
        }
    }, 5000); //5 second timeout for disconnecting socket if not authenticated.
  
    socket.on("testMessage", function(data){
     console.log("recieved message from authenticated client"); 
    });
 
    socket.on("post:contactList", function(data){
        console.log("INCOMING CONTACT:" + data);
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
    
     socket.on('disconnect', function(data){
        console.log('user disconnected: ' + socket.id);
        
        ConnectedClients.findOneAndRemove({'socketID':socket.id}, function(err){
            if(err)
            {
                console.log("COULDN'T REMOVE SOCKET: " + err);
            }
        });
        
        ConnectedClients.find({}, function(err, connectedClients){
            if(!err)
            {
                console.log("CONNECTED CLIENTS: " + connectedClients);
                io.sockets.emit('connectedClientsUpdate', connectedClients);
            }
        });
    });
});