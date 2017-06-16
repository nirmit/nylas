var mongoose = require('mongoose');

var calendarSchema = mongoose.Schema({
		nylas_id : String,
		account_id : String,
        name : String,
        description : String,
        mailbox_token : String
});

module.exports = mongoose.model('Calendar', calendarSchema);
