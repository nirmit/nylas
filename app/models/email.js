var mongoose = require('mongoose');

var emailMessagesSchema = mongoose.Schema({
        from : String,
        to : String,
        subject : String,
        body : String,
        date_timestamp : String,
        user_id : String
});

module.exports = mongoose.model('Email', emailMessagesSchema);
