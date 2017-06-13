"use strict";

let Mailbox = require("../models/mailboxes");
 
module.exports = {

  addNewRecord: (user_id, account_id, email, name, token,callback) => {
        Mailbox.findOne({user_id : user_id, email: email}, (err, mailbox) => {
          if(err) { return callback(false, "there is an error") };
          console.log('mailbox'); 
          console.log(mailbox); 
          if(typeof(mailbox) === "undefined" || mailbox === null) {
            mailbox = new Mailbox();
            mailbox.email = email;
            mailbox.name = name;
            mailbox.user_id = user_id;
            mailbox.account_id = account_id;
            mailbox.token = token;
            mailbox.save((err) => {
                if(err) { return callback(false, errorMessage); }
                return callback(true, 'Email authorized Successfully.');
            }); 
          } else {
            return callback(false, "Email already exists.");
          }
        });
    },

    getList: (user_id,callback) => {
        Mailbox.find({user_id: user_id}, (err, list) => {
           // console.log(list)
           if(err) { return callback(false, "Failed to get list. Please try again later.") };

           if(typeof(list) === "undefined" || list === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, list);
           }
        });
    }


    // deleteMailbox: (mailbox_token,callback) => {
    //     Mailbox.find({mailbox_token : mailbox_token}, (err) => {
    //        Mailbox.remove({mailbox_token: mailbox_token}, (err, result) => {
    //            if(typeof(result) === "undefined" || result === null) {
    //                return callback(false, err);
    //            } else {
    //                return callback(true, result);
    //            }
    //         });
    //     });
    // },

  
}



