"use strict";

let Calendar = require("../models/calendars");
let Event = require("../models/events");
 
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
  
    addNewCalendar: (nylas_id,account_id,name,description, callback) => {           
        Calendar.findOne({nylas_id: nylas_id}, (err, calendar) => {
           if(err) { return callback(false, "") };                  
           if(typeof(calendar) === "undefined" || calendar === null) {                    
                calendars = new Calendar();
                calendars.nylas_id = nylas_id;
                calendars.account_id = account_id;
                calendars.name = name;
                calendars.description = description;
                calendars.save((err) => {
                    if(err) { return callback(false, errorMessage); }
                    return callback(true, 'calendar added successfully.');

                });

           } else{
              return callback(true, 'calendar added successfully.');
           }
        });
    }


}
