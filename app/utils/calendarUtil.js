"use strict";

let Calendar = require("../models/calendars");
 
module.exports = {


    getCalendarList: (callback) => {
        Calendar.find((err, calendarlist) => {
           if(err) { return callback(false, "Failed to get contactlist. Please try again later.") };

           if(typeof(calendarlist) === "undefined" || calendarlist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, calendarlist);
           }
        });
    },


    RemoveCalendarfromDB: (nylas_id,callback) => {
        Calendar.findOne({nylas_id : nylas_id}, (err) => {
           Calendar.remove({nylas_id: nylas_id}, (err, result) => {
               if(typeof(result) === "undefined" || result === null) {
                   return callback(true, err);
               } else {
                   return callback(true, result);
               }
            });
        });
    },
  
  
    addNewCalendar: (nylas_id,name, callback) => {           
         Calendar.findOne({nylas_id: nylas_id}, (err, calendars) => {
           if(err) { return callback(false, "") };                  
           if(typeof(emails) === "undefined" || emails === null) {                    
                calendars = new Calendar();
                calendars.nylas_id = nylas_id;                
                calendars.name = name;                                
                calendars.save((err) => {
                    if(err) { return callback(false, errorMessage); }
                    return callback(true, 'calendar create successfully.');

                });

           } else{
              return callback(true, 'calendar create successfully.');
               } 
          });
    },

    
  
}
