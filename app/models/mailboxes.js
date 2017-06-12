var mongoose = require('mongoose');

var mailboxSchema = mongoose.Schema({
        user_id : String,
        account_id : String,
        name : String,
        email : String,
        token : String
});

module.exports = mongoose.model('Mailbox', mailboxSchema);
