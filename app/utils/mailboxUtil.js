"use strict";

let Mailbox = require("../models/mailboxes");
 
module.exports = {

  addNewEmail: (user_id, email, name, token,callback) => {           
         Mailbox.findOne({user_id : user_id, token: token}, (err, mailbox) => {
           if(err) { return callback(false, "there is an error") };
          
              mailbox = new Mailbox();
              mailbox.email = email;
              mailbox.name = name;
              mailbox.token = token;
              mailbox.save((err) => {
                  if(err) { return callback(false, errorMessage); }
                  return callback(true, 'Email authorized Successfully.');
              }); 
                    
        });
    },


    getList: (callback) => {
        Mailbox.find((err, list) => {
           // console.log(list)
           if(err) { return callback(false, "Failed to get list. Please try again later.") };

           if(typeof(list) === "undefined" || list === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, list);
           }
        });
    }

  
}



