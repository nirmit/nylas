"use strict";

let Email = require("../models/email");
 
module.exports = {

    getEmailList: (user_id, callback) => {
        Email.find({user_id : user_id},(err, emaillist) => {
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

  addNewEmail: (nylas_id,from,to,subject,message,timestamp,user_id,callback) => {           
         Email.findOne({nylas_id : nylas_id}, (err, emails) => {
           if(err) { return callback(false, "") };                 
           if(typeof(emails) === "undefined" || emails === null) { 
                emails = new Email();
                emails.from = from;                                              
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
