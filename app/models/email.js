var mongoose = require('mongoose');

var emailMessagesSchema = mongoose.Schema({
	nylas_id : String,
        from : String,
        to : String,
        cc : String,
        bcc : String,
        subject : String,
        body : String,
        date_timestamp : Date,
        user_id : String,
        mailbox_token : String,
        email_type : String
});

module.exports = mongoose.model('Email', emailMessagesSchema);
