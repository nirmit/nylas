var mongoose = require('mongoose');

var calenderSchema = mongoose.Schema({
		nylas_id : String,
		account_id : String,
        name : String,
        description : String
});

module.exports = mongoose.model('Calendar', calenderSchema);
