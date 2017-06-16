"use strict";

let User = require("../models/user");
 
module.exports = {

    isvalidEmail: (email) => {
        let expression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            regex = new RegExp(expression);
 
        if(email.match(regex) ) {
            return true;
        } else {
            return false;
        }
    },

    getUserList: (callback) => {
        User.find((err, userllist) => {
           if(err) { return callback(false, "Failed to get userllist. Please try again later.") };

           if(typeof(userllist) === "undefined" || userllist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, userllist);
           }
        });
    },


    RemoveUserfromDB: (userid, callback) => {
        User.findOne({_id: userid}, (err, url) => {
           User.remove({_id: userid}, (err, result) => {
               if(typeof(result) === "undefined" || result === null) {
                   return callback(false, err);
               } else {
                   return callback(true, result);
               }
            });
        });
    },


    updateUserDetails: (userid, firstname,lastname, email, password,role,callback) => {
      console.log(userid)
        if(password != ''){
            var puser = new User();
            var passstring = puser.generateHash(password);
            User.findOneAndUpdate({_id: userid}, { $set: { 'firstname':firstname, 'lastname':lastname,  'email':email, 'password':passstring, 'role': role}}, {returnNewDocument: true}, (err, user) => {
           if(err) { return callback(false, "Failed to get user details. Please try again later.") };
               if(typeof(user) === "undefined" || user === null) {
                   return callback(false, "user not found.");
               } else {
                   callback(true, user);
               }
            });
        }else{
            User.findOneAndUpdate({_id: userid}, { $set: {'firstname':firstname, 'lastname':lastname,  'email':email,'role': role}}, {returnNewDocument: true}, (err, user) => {
           if(err) { return callback(false, "Failed to get user details. Please try again later.") };
               if(typeof(user) === "undefined" || user === null) {
                   return callback(false, "user not found.");
               } else {
                   callback(true, user);
               }
            });
        }        
    },

    UpdateToken: ( email, accessToken,callback) => {
         User.findOneAndUpdate({email: email}, { $set: {'token':accessToken }}, {returnNewDocument: true}, (err, user) => {
            if(err) { return callback(false, "Failed to get user details. Please try again later.") };
            if(typeof(user) === "undefined" || user === null) {
                return callback(false, "user not found.");
            } else {
                callback(true, user);
            }
         });     
    },


    getUserDetails: (userid, callback) => {
        User.findOne({_id: userid}, (err, user) => {
           if(err) { return callback(false, "Failed to get user details. Please try again later.") };

           if(typeof(user) === "undefined" || user === null) {
               return callback(false, "user not found.");
           } else {
               callback(true, user);
           }
        });
    },    
    
  
    addNewUser: (firstname,lastname,email,password,role, callback) => {
         User.findOne({'email': email}, (err, user) => {
           if(err) { return callback(false, "Failed to get original url. Please try again later.") };

           if(typeof(user) === "undefined" || user === null) {
                user = new User();
                user.firstname = firstname;
                user.lastname = lastname;
                user.email = email;               
                user.password = user.generateHash(password);
                user.role = role;
                user.save((err) => {
                    if(err) { return callback(false, errorMessage); }
                    return callback(true, 'User Create Successfully.');
                });
           } else {
               callback(true, 'User Already Exists, Please try any other email address.');
           }
        });
    },    
  
}
