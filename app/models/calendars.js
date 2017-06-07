var mongoose = require('mongoose');

var emailSchema = mongoose.Schema({

        nylas_id     : String,        
        name         : String      
        

});

module.exports = mongoose.model('Calendar', emailSchema);
