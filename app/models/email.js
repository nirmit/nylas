var mongoose = require('mongoose');

var emailSchema = mongoose.Schema({

        nylas_id     : String,        
        subject      : String,      
        account_id   : String      
        

});

module.exports = mongoose.model('Email', emailSchema);
