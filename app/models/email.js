var mongoose = require('mongoose');

var emailMessagesSchema = mongoose.Schema({
        from : String,
        to : String,
        cc : String,
        bcc : String,
        body : String,
        date : String,
        mailbox_id : String,
        subject : String
});

module.exports = mongoose.model('Email', emailMessagesSchema);
