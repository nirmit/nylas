var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
		nylas_calender_id : String,
		account_id : String,
        name : String,
        description : String,
        user_id : String
});

module.exports = mongoose.model('Event', eventSchema);
