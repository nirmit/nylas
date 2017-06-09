"use strict";

let Email = require("../models/email");
 
module.exports = {


    getEmailList: (callback) => {
        Email.find((err, emaillist) => {
           if(err) { return callback(false, "Failed to get contactlist. Please try again later.") };            
           if(typeof(emaillist) === "undefined" || emaillist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, emaillist);
           }
        });
    },


    RemoveEmailfromDB: (nylas_id,callback) => {
        Email.findOne({nylas_id : nylas_id}, (err) => {
           Email.remove({nylas_id: nylas_id}, (err, result) => {
               if(typeof(result) === "undefined" || result === null) {
                   return callback(true, err);
               } else {
                   return callback(true, result);
               }
            });
        });
    },

  
  
  addNewEmail: (nylas_id,subject,callback) => {           
         Email.findOne({nylas_id : nylas_id}, (err, emails) => {
           if(err) { return callback(false, "") };                 
           if(typeof(emails) === "undefined" || emails === null) { 
                emails = new Email();                               
                emails.subject = subject;                                               
                emails.save((err) => {
                    if(err) { return callback(false, errorMessage); }
                    return callback(true, 'email Create Successfully.');
                });

           } else{
              return callback(true, 'email Create Successfully.');
              } 
        });
    },
  
}
