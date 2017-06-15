var mongoose = require('mongoose');

var emailSchema = mongoose.Schema({

            location : String        

});

module.exports = mongoose.model('Calendar', emailSchema);
