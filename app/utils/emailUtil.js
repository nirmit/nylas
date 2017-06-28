"use strict";

let Email = require("../models/email");
let Mailbox = require("../models/mailboxes");
 
module.exports = {

  // for all emails 

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

    // for emails based on email type 

    getEmailTypeList: (user_id, mailbox_token, email_type, callback) => {
        Email.find({user_id: user_id, mailbox_token: mailbox_token, email_type : email_type},(err, emaillist) => {
           if(err) { return callback(false, "Failed to get emails. Please try again later.") };            
           if(typeof(emaillist) === "undefined" || emaillist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, emaillist);
           }
        });
    },

    getEmailListForReports: (user_id,email,email_type,selmon,selyear,search,callback) => {
      
      Mailbox.findOne({user_id : user_id, email : email }, (err, mailbox) => {
        var mailbox_token = mailbox.token;
        if(selmon == '00'){
          var start = new Date(selyear, 0, 1)
          var end = new Date(selyear, 11, 30)
        }else{
          var start = new Date(selyear, selmon-1, 1)
          var end = new Date(selyear, selmon-1, 30)
         
        }
        if(search == 'timebubbleline'){
          Email.find({mailbox_token : mailbox_token, date_timestamp : { $gte : start, $lte : end}}, (err,emaillist) => {
              if(typeof(emaillist) === "undefined" || emaillist === null) {
                   return callback(false, "No records Found.");
               } else {
                   callback(true, emaillist);
               }
          })
        }else{
          if(email_type == 'received' || email_type == 'sent'){
            Email.find({mailbox_token : mailbox_token, email_type : email_type},{'_id': 0, 'body': 1, 'email_type': 1, 'subject': 1,'from': 1,'to':1,'date_timestamp':1,user_id:1},(err, emaillist) => {
               
              if(typeof(emaillist) === "undefined" || emaillist === null) {
                   return callback(false, "No records Found.");
               } else {
                   callback(true, emaillist);
               }

            });
          }else{
            Email.find({mailbox_token : mailbox_token},{'_id': 0, 'body': 1, 'email_type': 1, 'subject': 1,'from': 1,'to':1,'date_timestamp':1},(err, emaillist) => {
               if(err) { return callback(false, "Failed to get emails. Please try again later.") };            
               if(typeof(emaillist) === "undefined" || emaillist === null) {
                   return callback(false, "No records Found.");
               } else {
                   callback(true, emaillist);
               }
            });
          }
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

    addNewEmail: (nylas_id,mailbox_token,from,to,cc,bcc,subject,message,timestamp,email_type,user_id,callback) => {           
         Email.findOne({nylas_id : nylas_id, mailbox_token : mailbox_token }, (err, emails) => {
          
           if(err) { return callback(false, "") };
           if(typeof(emails) === "undefined" || emails === null) {
              emails = new Email();
              emails.nylas_id = nylas_id;
              emails.from = from;
              emails.mailbox_token = mailbox_token;
              emails.to = to;
              emails.cc = cc;
              emails.bcc = bcc;
              emails.subject = subject;                                        
              emails.body = message;                                              
              emails.date_timestamp = timestamp;
              emails.email_type = email_type;                                          
              emails.user_id = user_id;                       
              emails.save((err) => {
                  if(err) { return callback(false, errorMessage); }
                  return callback(true, 'emails created Successfully.');
              });

           } else{            
            Email.findOneAndUpdate({nylas_id: nylas_id, mailbox_token : mailbox_token}, { $set: { 'from': from, 'subject': subject, 'body' : message, 'cc' : cc, 'bcc' : bcc }}, {returnNewDocument: true}, (err, emails) => {
                if(err) { return callback(false, "Couldn't update your emails") };
  
              });
           } 
        });
    },
  
}
