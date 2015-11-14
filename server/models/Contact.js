var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Creating the contact schema.
var contactSchema = new Schema({
   
   name: {
       type: String,
       required: true
   },
   
   email: {
       type: String,
       required: true
   },
   
   number: {
       type: String,
       required: true
   }
});

var Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;