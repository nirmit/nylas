var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
        firstname    : String,
        lastname     : String,
        email        : String,
        password     : String,
        phone        : String,
        accessToken  : String
        				

});


userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


userSchema.methods.validGooglePassword = function(password) {
	if(this.google.password){
		return bcrypt.compareSync(password, this.password);
	}else{
		return false;	
	}
};


module.exports = mongoose.model('User', userSchema);
