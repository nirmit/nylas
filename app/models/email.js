var mongoose = require('mongoose');

var emailMessagesSchema = mongoose.Schema({
		nylas_id : String,
        from : String,
        to : String,
        cc : String,
        bcc : String,
        subject : String,
        body : String,
        date_timestamp : String,
        user_id : String,
        mailbox_token : String
});

module.exports = mongoose.model('Email', emailMessagesSchema);
