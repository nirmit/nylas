"use strict";

let Calendar = require("../models/calendars");
let Event = require("../models/events");
 
Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}

module.exports = {

    getCalendarList: (mailbox_token,callback) => {
        Calendar.find({mailbox_token:mailbox_token},(err, calendarlist) => {
           if(err) { return callback(false, "Failed to get contactlist. Please try again later.") };

           if(typeof(calendarlist) === "undefined" || calendarlist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, calendarlist);
           }
        });
    },

    getEventList: (calendar_id,callback) => {
        Event.find({nylas_calendar_id:calendar_id},(err, eventlist) => {
           if(err) { return callback(false, "Failed to get event list. Please try again later.") };

           if(typeof(eventlist) === "undefined" || eventlist === null) {
               return callback(false, "No records Found.");
           } else {
               callback(true, eventlist);
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
  
    addNewCalendar: (nylas_id,mailbox_token,account_id,name,description, callback) => {           
        Calendar.findOne({nylas_id: nylas_id}, (err, calendar) => {
           if(err) { return callback(false, "") }; 
           if(calendar === null) {
              calendar = new Calendar();
              calendar.nylas_id = nylas_id;
              calendar.mailbox_token = mailbox_token;
              calendar.account_id = account_id;
              calendar.name = name;
              calendar.description = description;
              calendar.save((err) => {
                  if(err) { return callback(false, errorMessage); }
                  return callback(true, 'calendar added successfully.');

              });

           } else{
              return callback(true, 'calendar added successfully.');
           }
        });
    },
  
    addNewEvent: (event,mailbox_token, callback) => {

      var nylas_id = event.id;
      var nylas_calendar_id = event.calendarId;
      var account_id = event.accountId;
      var title = event.title;
      var description = event.description;
      var location = event.location;
      var start = '';
      var end = '';
      var participants = ''

      if(event.when){
        var sd = new Date(event.when.start_time * 1000);
        start = sd.getDate()+'-'+(sd.getMonth()+1)+'-'+sd.getFullYear()+' '+sd.getHours().padLeft()+':'+sd.getMinutes().padLeft();

        var ed = new Date(event.when.end_time * 1000);
        end = ed.getDate() + '-' + (ed.getMonth()+1) + '-' + ed.getFullYear()+' '+ed.getHours().padLeft()+':'+ed.getMinutes().padLeft();
      }

      if(event.participants.length > 0){
        for(i = 0; i < event.participants.length; i++){
          if(participants == ''){
            participants += event.participants[i].name
          }else{
            participants += ', '+event.participants[i].name
          }
        }
      }

      Event.findOne({nylas_id: event.id}, (err, event) => {
        if(err) { return callback(false, err) };
        if(event === null) {
          event = new Event();
          event.nylas_id = nylas_id;
          event.nylas_calendar_id = nylas_calendar_id;
          event.account_id = account_id;
          event.title = title;
          event.description = description;
          event.location = location;
          event.start = start;
          event.end = end;
          event.participants = participants;
          event.save((err) => {
              if(err) { return callback(false, errorMessage); }
              return callback(true, 'event added successfully.');

          });
        }else{
          return callback(true, 'event added successfully.');
        }

      });

    }


}
