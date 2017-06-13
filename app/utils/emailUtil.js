"use strict";

let Email = require("../models/email");
 
module.exports = {

    getEmailList: (user_id, mailbox_token, callback) => {
        Email.find({user_id: user_id, mailbox_token: mailbox_token},(err, emaillist) => {
           if(err) { return callback(false, "Failed to get emails. Please try again later.") };            
           if(typeof(emaillist) === "undefined" || emaillist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, emaillist);
           }
        });
    },

    getEmailListForReports: (user_id, callback) => {
        Email.find({user_id : user_id},{'_id': 0, 'subject': 1,'from': 1,'to':1,'date_timestamp':1},(err, emaillist) => {
           if(err) { return callback(false, "Failed to get emails. Please try again later.") };            
           if(typeof(emaillist) === "undefined" || emaillist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, emaillist);
           }
        });
    },


    deleteEmails: (mailbox_token,callback) => {
        Email.find({mailbox_token : mailbox_token}, (err) => {
           Email.remove({mailbox_token: mailbox_token}, (err, result) => {
               if(typeof(result) === "undefined" || result === null) {
                   return callback(false, err);
               } else {
                   return callback(true, result);
               }
            });
        });
    },

  addNewEmail: (nylas_id,mailbox_token,from,to,subject,message,timestamp,user_id,callback) => {           
         Email.findOne({nylas_id : nylas_id}, (err, emails) => {
           if(err) { return callback(false, "") };                 
           if(typeof(emails) === "undefined" || emails === null) { 
                emails = new Email();
                emails.from = from;
                emails.mailbox_token = mailbox_token;
                emails.to = to;
                emails.subject = subject;                                        
                emails.body = message;                                              
                emails.date_timestamp = timestamp;                                          
                emails.user_id = user_id;                       
                emails.save((err) => {
                    if(err) { return callback(false, errorMessage); }
                    return callback(true, 'email fetched Successfully.');
                });

           } else{
            return callback(true, 'email fetched Successfully.');
           } 
        });
    },
  
}
