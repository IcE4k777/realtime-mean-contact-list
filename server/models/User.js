var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

//default for bcrypt is 10. Change this to a highvalue for a more secure password hash. 
//The higher the value the more CPU time / cycles required. Read bcrypt docs to understand
//more on how this works.
var SALT_WORK_FACTOR = 10; 

//Creating the contact schema.
var UserSchema = new Schema({
   
   name: {
      type: String,
      required: true
   },
   
   normalizedName: {
       type: String,
       lowercase: true,
       required: true
   },
   
   email: {
       type: String,
       required: true
   },
   
   normalizedEmail: {
       type: String,
       required: true,
       lowercase : true
   },
   
   username: {
      type: String,
      required: true
   },
   
   normalizedUsername: {
     type: String,
     required: true,
     lowercase : true
   },
   
   password: {
       type: String,
       required: true
   },
});

UserSchema.pre('save', function(next) {
    var user = this;

   // only hash the password if it has been modified (or is new)
   if (!user.isModified('password')){
      return next();
   }
   
   // generate a salt
   bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
       if (err){
          return next(err);
       }
   
       // hash the password using our new salt
       bcrypt.hash(user.password, salt, function(err, hash) {
           if (err){
              return next(err);
           }
   
           // override the cleartext password with the hashed one
           user.password = hash;
           next();
       });
   });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) {
           return cb(err);
        }
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', UserSchema);
module.exports = User;