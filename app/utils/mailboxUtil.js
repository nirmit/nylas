"use strict";

let Mailbox = require("../models/mailboxes");
 
module.exports = {

  addNewEmail: (nylas_id,subject,callback) => {           
         Mailbox.findOne({nylas_id : nylas_id}, (err, mailbox) => {
           if(err) { return callback(false, "") };                 
              mailbox = new Mailbox();
              mailbox.subject = subject;                           
              mailbox.save((err) => {
                  if(err) { return callback(false, errorMessage); }
                  return callback(true, 'Email authorized Successfully.');
              });
        });
    }
  
}
