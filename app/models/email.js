var mongoose = require('mongoose');

var emailSchema = mongoose.Schema({

                
        subject      : String      
            
        

});

module.exports = mongoose.model('Email', emailSchema);
