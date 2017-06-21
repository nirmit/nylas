var mongoose = require('mongoose');

var eventSchema = mongoose.Schema({
		nylas_id : String,
		nylas_calendar_id : String,
		account_id : String,
        title : String,
        description : String,
        location : String,
        start : String,
        end : String,
        participants : String,
        mailbox_token : String
});

module.exports = mongoose.model('Event', eventSchema);
