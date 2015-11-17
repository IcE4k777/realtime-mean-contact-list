var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connectedClientSchema = new Schema({
   
   socketID: {
       type: String,
       required: true
   },
   
   username: {
       type: String,
       required: true
   },
});

var ConnectedClients = mongoose.model('ConnectedClients', connectedClientSchema);
module.exports = ConnectedClients;